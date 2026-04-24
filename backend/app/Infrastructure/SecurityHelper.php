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
     * Envía una respuesta JSON con el código HTTP correspondiente.
     *
     * @param mixed $data   Datos a enviar
     * @param int   $status Código HTTP
     */
    public static function jsonResponse(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
