<?php

namespace App\Controllers;

use App\UseCases\RegisterUser;
use App\UseCases\LoginUser;
use App\UseCases\RegisterStore;
use App\UseCases\UpdateProfile;
use App\Infrastructure\MySQLUserRepository;
use App\Infrastructure\MySQLStoreRepository;
use App\Infrastructure\SecurityHelper;
use App\Infrastructure\ImageHelper;

/**
 * Controlador REST para autenticación.
 * Maneja las peticiones HTTP de login y registro.
 */
class AuthController
{
    private RegisterUser $registerUser;
    private LoginUser $loginUser;
    private RegisterStore $registerStore;
    private UpdateProfile $updateProfile;

    public function __construct()
    {
        $userRepository = new MySQLUserRepository();
        $storeRepository = new MySQLStoreRepository();
        
        $this->registerUser = new RegisterUser($userRepository);
        $this->loginUser = new LoginUser($userRepository);
        $this->registerStore = new RegisterStore($storeRepository);
        $this->updateProfile = new UpdateProfile($userRepository, $storeRepository);
    }

    /**
     * POST /register
     * Registra un nuevo usuario.
     */
    public function register(): void
    {
        $input = SecurityHelper::getJsonInput();

        // Validar campos requeridos para usuario
        $requiredUser = ['name', 'lastname', 'birthday', 'email', 'username', 'password'];
        foreach ($requiredUser as $field) {
            if (!isset($input[$field]) || empty(trim((string)$input[$field]))) {
                SecurityHelper::jsonResponse(['error' => "El campo '$field' es obligatorio."], 400);
            }
        }

        // Validar fortaleza de la contraseña
        if (!SecurityHelper::validatePassword($input['password'])) {
            SecurityHelper::jsonResponse([
                'error' => 'La contraseña no cumple con los requisitos mínimos: al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.'
            ], 400);
        }

        try {
            $idStore = $input['id_store'] ?? null;

            // Si no hay id_store, intentamos registrar una nueva tienda
            if (!$idStore) {
                if (!isset($input['store']) || empty(trim($input['store']))) {
                    SecurityHelper::jsonResponse(['error' => "El campo 'store' (nombre de la tienda) es obligatorio si no se proporciona 'id_store'."], 400);
                }

                // Procesar imagen del logo si existe
                $logoData = ['url' => null, 'colors' => null];
                if (!empty($input['image'])) {
                    $logoData = ImageHelper::processAndSaveImage($input['image'], 'logos');
                }

                $storeData = [
                    'store'        => SecurityHelper::sanitize($input['store']),
                    'dialing_code' => isset($input['dialing_code']) ? SecurityHelper::sanitize($input['dialing_code']) : null,
                    'cellphone'    => isset($input['cellphone']) ? SecurityHelper::sanitize($input['cellphone']) : null,
                    'image'        => $logoData['url'],
                    'colors'       => $logoData['colors'],
                ];

                $idStore = $this->registerStore->execute($storeData);
            }

            // Sanitizar entradas de usuario
            $userData = [
                'name'      => SecurityHelper::sanitize($input['name']),
                'lastname'  => SecurityHelper::sanitize($input['lastname']),
                'birthday'  => SecurityHelper::sanitize($input['birthday']),
                'email'     => SecurityHelper::sanitize($input['email']),
                'username'  => SecurityHelper::sanitize($input['username']),
                'password'  => $input['password'],
                'id_store'  => $idStore,
                'id_plan'   => isset($input['id_plan']) ? (int)$input['id_plan'] : 0,
            ];

            $user = $this->registerUser->execute($userData);

            SecurityHelper::jsonResponse([
                'message' => 'Usuario y tienda registrados exitosamente.',
                'data'    => $user,
            ], 201);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse(['error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al registrar el usuario: ' . $e->getMessage()],
                500
            );
        }
    }

    /**
     * POST /login
     * Autentica un usuario.
     */
    public function login(): void
    {
        $input = SecurityHelper::getJsonInput();

        // Validar campos requeridos
        $required = ['username', 'password'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty(trim((string)$input[$field]))) {
                SecurityHelper::jsonResponse(
                    ['error' => "El campo '$field' es obligatorio."],
                    400
                );
            }
        }

        try {
            $user = $this->loginUser->execute(
                SecurityHelper::sanitize($input['username']),
                $input['password']
            );

            SecurityHelper::jsonResponse([
                'message' => 'Login exitoso.',
                'data'    => $user,
            ]);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse(['error' => $e->getMessage()], 401);
        } catch (\Throwable $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al iniciar sesión: ' . $e->getMessage()],
                500
            );
        }
    }

    /**
     * Maneja la solicitud de recuperación de contraseña.
     */
    public function forgotPassword(): void
    {
        $input = SecurityHelper::getJsonInput();
        $email = $input['email'] ?? null;

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            SecurityHelper::jsonResponse(['error' => 'Por favor ingrese un correo electrónico válido.'], 400);
        }

        // 1. Buscar usuario por email
        $user = $this->userRepo->findByEmail($email);
        if (!$user) {
            // Por seguridad, no decimos si el email existe o no, pero aquí regresamos error para depuración
            SecurityHelper::jsonResponse(['error' => 'No se encontró ninguna cuenta asociada a este correo.'], 404);
        }

        // 2. Generar contraseña temporal segura (8 caracteres)
        $tempPass = SecurityHelper::generateRandomPassword(8);

        // 3. Guardar en tabla tmp_pass con expiración de 10 min
        $tempRepo = new \App\Infrastructure\MySQLTemporaryPasswordRepository();
        
        // Limpiar registros previos del usuario
        $tempRepo->deleteForUser($user->getId());
        
        $saved = $tempRepo->save($user->getId(), $tempPass, 10);

        if (!$saved) {
            SecurityHelper::jsonResponse(['error' => 'No se pudo generar la clave temporal.'], 500);
        }

        // 4. Obtener la plantilla de correo
        $emailHtml = \App\Infrastructure\EmailHelper::getTemporaryPasswordTemplate($user->getName(), $tempPass);

        // 5. Obtener configuración de base de datos
        $configRepo = new \App\Infrastructure\MySQLConfigRepository();
        $config = $configRepo->get();

        $fromName = $config->getName() ?: 'ShoppyCatalog';
        $fromEmail = $config->getEmail() ?: 'no-reply@shoppyCatalog.com';
        $smtpPassword = $config->getPassword();
        $smtpPort = $config->getPort() ?: 587;

        // 6. Enviar el correo usando PHPMailer
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        $sentSuccessfully = false;

        try {
            // Configuración del Servidor SMTP
            $mail->isSMTP();
            $mail->CharSet = 'UTF-8';
            
            // Determinar host SMTP (desde entorno, o auto-detectado, o localhost)
            $smtpHost = getenv('SMTP_HOST') ?: ($_ENV['SMTP_HOST'] ?? 'localhost');
            if ($smtpHost === 'localhost' && !empty($fromEmail)) {
                $parts = explode('@', $fromEmail);
                if (count($parts) === 2) {
                    $domain = strtolower($parts[1]);
                    if ($domain === 'gmail.com') {
                        $smtpHost = 'smtp.gmail.com';
                    } elseif ($domain === 'hotmail.com' || $domain === 'outlook.com' || $domain === 'live.com') {
                        $smtpHost = 'smtp.office365.com';
                    } elseif ($domain === 'yahoo.com') {
                        $smtpHost = 'smtp.mail.yahoo.com';
                    } else{
                        $smtpHost = $config->getHost();
                    }
                }
            }
            $mail->Host = $smtpHost;

            // Autenticación SMTP si hay contraseña
            if (!empty($smtpPassword)) {
                $mail->SMTPAuth = true;
                $mail->Username = $fromEmail;
                $mail->Password = $smtpPassword;
                
                // Configurar encriptación según el puerto
                if ($smtpPort == 465) {
                    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
                } else {
                    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                }
            } else {
                $mail->SMTPAuth = false;
            }

            $mail->Port = $smtpPort;

            // Opciones de SMTP para entornos locales (evita fallos de verificación SSL autogenerados de XAMPP)
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );

            // Destinatarios
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($email);

            // Contenido del Correo
            $mail->isHTML(true);
            $mail->Subject = 'Recuperación de contraseña - ' . $fromName;
            $mail->Body    = $emailHtml;
            $mail->AltBody = strip_tags(str_replace('<br>', "\n", $emailHtml));

            $mail->send();
            $sentSuccessfully = true;
        } catch (\Throwable $e) {
            // Logear el error para depuración
            \App\Infrastructure\Logger::log("Error al enviar con PHPMailer: " . $mail->ErrorInfo . " | Detalle: " . $e->getMessage(), 'MAIL');
        }

        // 7. Fallback: Si falló el envío por SMTP (PHPMailer), usamos la función mail() local de PHP como respaldo
        if (!$sentSuccessfully) {
            if ($fromEmail) {
                @ini_set('sendmail_from', $fromEmail);
            }
            if ($smtpPort) {
                @ini_set('smtp_port', (string)$smtpPort);
            }

            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= 'From: ' . $fromName . ' <' . $fromEmail . '>' . "\r\n";
            
            @mail($email, "Recuperación de contraseña - " . $fromName, $emailHtml, $headers);
        }

        SecurityHelper::jsonResponse([
            'message' => 'Se ha enviado un correo con tu contraseña temporal. Revisa tu bandeja de entrada.',
            'debug_pass' => $tempPass // Solo para desarrollo, quitar en producción
        ]);
    }

    public function updateProfile(): void
    {
        // Obtener el ID del usuario de la URL (PUT /users/{id})
        $uri = $_SERVER['REQUEST_URI'];
        $parts = explode('/', rtrim($uri, '/'));
        $userId = end($parts);

        $input = SecurityHelper::getJsonInput();

        try {
            $user = $this->updateProfile->execute($userId, $input);

            SecurityHelper::jsonResponse([
                'message' => 'Perfil actualizado exitosamente.',
                'data'    => $user->toArray(),
            ]);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse(['error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al actualizar el perfil: ' . $e->getMessage()],
                500
            );
        }
    }

    public function changePassword(): void
    {
        $input = SecurityHelper::getJsonInput();
        $userId = $input['user_id'] ?? null;
        $newPassword = $input['password'] ?? null;

        if (!$userId || !$newPassword) {
            SecurityHelper::jsonResponse(['error' => 'Datos insuficientes.'], 400);
        }

        // Validar fortaleza
        if (!SecurityHelper::validatePassword($newPassword)) {
            SecurityHelper::jsonResponse(['error' => 'La contraseña no cumple con los requisitos de seguridad.'], 422);
        }

        try {
            $user = $this->userRepo->findById($userId);
            if (!$user) {
                SecurityHelper::jsonResponse(['error' => 'Usuario no encontrado.'], 404);
            }

            // Actualizar contraseña (hasheada)
            $user->setPassword(password_hash($newPassword, PASSWORD_BCRYPT));
            $this->userRepo->update($user);

            // Limpiar tabla de contraseñas temporales para este usuario
            $tempRepo = new \App\Infrastructure\MySQLTemporaryPasswordRepository();
            $tempRepo->deleteForUser($userId);

            SecurityHelper::jsonResponse(['message' => 'Contraseña actualizada exitosamente.']);
        } catch (\Throwable $e) {
            SecurityHelper::jsonResponse(['error' => 'Error al cambiar la contraseña: ' . $e->getMessage()], 500);
        }
    }
}
