<?php

namespace App\Infrastructure;

/**
 * Helper para generar y validar JSON Web Tokens (JWT).
 * Implementación manual sin dependencias externas.
 */
class JWTHelper
{
    /**
     * Genera un token JWT.
     */
    public static function generate(array $payload): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        
        $secret = $_ENV['JWT_SECRET'] ?? 'default-secret';
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Valida un token JWT y devuelve el payload si es válido.
     */
    public static function validate(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        list($header, $payload, $signature) = $parts;
        
        $secret = $_ENV['JWT_SECRET'] ?? 'default-secret';
        $validSignature = self::base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, $secret, true));
        
        if ($signature !== $validSignature) {
            return null;
        }
        
        $data = json_decode(self::base64UrlDecode($payload), true);
        
        // Verificar expiración si existe
        if (isset($data['exp']) && $data['exp'] < time()) {
            return null;
        }
        
        return $data;
    }

    private static function base64UrlEncode(string $data): string
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }
}
