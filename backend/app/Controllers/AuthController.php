<?php

namespace App\Controllers;

use App\UseCases\RegisterUser;
use App\UseCases\LoginUser;
use App\UseCases\RegisterStore;
use App\Infrastructure\MySQLUserRepository;
use App\Infrastructure\MySQLStoreRepository;
use App\Infrastructure\SecurityHelper;

/**
 * Controlador REST para autenticación.
 * Maneja las peticiones HTTP de login y registro.
 */
class AuthController
{
    private RegisterUser $registerUser;
    private LoginUser $loginUser;
    private RegisterStore $registerStore;

    public function __construct()
    {
        $userRepository = new MySQLUserRepository();
        $storeRepository = new MySQLStoreRepository();
        
        $this->registerUser = new RegisterUser($userRepository);
        $this->loginUser = new LoginUser($userRepository);
        $this->registerStore = new RegisterStore($storeRepository);
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

        try {
            $idStore = $input['id_store'] ?? null;

            // Si no hay id_store, intentamos registrar una nueva tienda
            if (!$idStore) {
                if (!isset($input['store']) || empty(trim($input['store']))) {
                    SecurityHelper::jsonResponse(['error' => "El campo 'store' (nombre de la tienda) es obligatorio si no se proporciona 'id_store'."], 400);
                }

                $storeData = [
                    'store'        => SecurityHelper::sanitize($input['store']),
                    // 'dialing_code' => isset($input['dialing_code']) ? SecurityHelper::sanitize($input['dialing_code']) : null,
                    // 'cellphone'    => isset($input['cellphone']) ? SecurityHelper::sanitize($input['cellphone']) : null,
                    // 'image'        => isset($input['image']) ? SecurityHelper::sanitize($input['image']) : null,
                    // 'colors'       => isset($input['colors']) ? SecurityHelper::sanitize($input['colors']) : null,
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
}
