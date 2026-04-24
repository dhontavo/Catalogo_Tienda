<?php

namespace App\Controllers;

use App\UseCases\RegisterUser;
use App\UseCases\LoginUser;
use App\Infrastructure\MySQLUserRepository;
use App\Infrastructure\SecurityHelper;

/**
 * Controlador REST para autenticación.
 * Maneja las peticiones HTTP de login y registro.
 */
class AuthController
{
    private RegisterUser $registerUser;
    private LoginUser $loginUser;

    public function __construct()
    {
        $repository = new MySQLUserRepository();
        $this->registerUser = new RegisterUser($repository);
        $this->loginUser = new LoginUser($repository);
    }

    /**
     * POST /register
     * Registra un nuevo usuario.
     */
    public function register(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            SecurityHelper::jsonResponse(
                ['error' => 'El cuerpo de la petición debe ser JSON válido.'],
                400
            );
        }

        // Validar campos requeridos
        $required = ['username', 'password'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty(trim($input[$field]))) {
                SecurityHelper::jsonResponse(
                    ['error' => "El campo '$field' es obligatorio."],
                    400
                );
            }
        }

        try {
            $user = $this->registerUser->execute(
                SecurityHelper::sanitize($input['username']),
                $input['password'] // No sanitizar la contraseña, se hashea
            );

            SecurityHelper::jsonResponse([
                'message' => 'Usuario registrado exitosamente.',
                'data'    => $user,
            ], 201);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al registrar el usuario.'],
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
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            SecurityHelper::jsonResponse(
                ['error' => 'El cuerpo de la petición debe ser JSON válido.'],
                400
            );
        }

        // Validar campos requeridos
        $required = ['username', 'password'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty(trim($input[$field]))) {
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
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al iniciar sesión.'],
                500
            );
        }
    }
}
