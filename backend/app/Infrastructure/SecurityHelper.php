<?php

namespace App\Infrastructure;

use App\Infrastructure\JWTHelper;

/**
 * Utilidades de seguridad para la API.
 * Maneja validación de API keys, sanitización y headers CORS.
 */
class SecurityHelper
{
    /**
     * Configura los headers CORS para permitir peticiones desde el frontend.
     *
     * @param string $allowedOrigin Origen permitido (default: *)
     */
    public static function setCorsHeaders(string $allowedOrigin = '*'): void
    {
        header("Access-Control-Allow-Origin: $allowedOrigin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
        header('Content-Type: application/json; charset=UTF-8');

        // Responder inmediatamente a preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    /**
     * Valida que la petición incluya una API Key válida.
     *
     * @param string $apiKey API Key enviada en el header
     * @return bool
     */
    public static function validateApiKey(string $apiKey): bool
    {
        // TODO: Validar contra la base de datos
        return !empty($apiKey) && strlen($apiKey) >= 32;
    }

    /**
     * Obtiene el token de autorización del header.
     */
    public static function getAuthToken(): ?string
    {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        
        if ($auth && preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
            return $matches[1];
        }
        
        return null;
    }

    /**
     * Verifica si el usuario está autorizado mediante un JWT válido.
     */
    public static function isAuthorized(): ?array
    {
        $token = self::getAuthToken();
        if (!$token) {
            return null;
        }
        
        return JWTHelper::validate($token);
    }


    /**
     * Sanitiza un string para prevenir XSS.
     *
     * @param string $input
     * @return string
     */
    public static function sanitize(string $input): string
    {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Obtiene y decodifica el cuerpo de la petición en formato JSON.
     * Si no es válido, envía una respuesta de error y termina la ejecución.
     *
     * @return array
     */
    public static function getJsonInput(): array
    {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            self::jsonResponse(
                [
                    'error' => 'El cuerpo de la petición debe ser JSON válido.',
                    'details' => json_last_error_msg()
                ],
                400
            );
        }

        return $input ?? [];
    }

    /**
     * Envía una respuesta JSON con el código HTTP correspondiente.
     *
     * @param mixed $data   Datos a enviar
     * @param int   $status Código HTTP
     */
    public static function jsonResponse(mixed $data, int $status = 200): void
    {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=UTF-8');
        }
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Genera una contraseña aleatoria segura de 8 caracteres.
     * Incluye mayúsculas, minúsculas, números y símbolos.
     * 
     * @param int $length Longitud de la contraseña (default 8)
     * @return string
     */
    public static function generateRandomPassword(int $length = 8): string
    {
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers   = '0123456789';
        $symbols   = '!@#$%^&*()-_=+[]{}|;:,.<>?';

        // Asegurar al menos uno de cada tipo
        $password = '';
        $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
        $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        $password .= $symbols[random_int(0, strlen($symbols) - 1)];

        // Rellenar el resto aleatoriamente
        $all = $uppercase . $lowercase . $numbers . $symbols;
        for ($i = strlen($password); $i < $length; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        // Mezclar los caracteres
        return str_shuffle($password);
    }

    /**
     * Valida que una contraseña cumpla con los requisitos de seguridad:
     * Al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos.
     * 
     * @param string $password
     * @return bool
     */
    public static function validatePassword(string $password): bool
    {
        if (strlen($password) < 8) return false;
        if (!preg_match('/[A-Z]/', $password)) return false;
        if (!preg_match('/[a-z]/', $password)) return false;
        if (!preg_match('/[0-9]/', $password)) return false;
        if (!preg_match('/[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/', $password)) return false;

        return true;
    }
}
