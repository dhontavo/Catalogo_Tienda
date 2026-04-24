<?php

namespace App\Infrastructure;

/**
 * Helper para cifrado y descifrado usando OpenSSL.
 */
class EncryptionHelper
{
    private static string $method = 'aes-256-cbc';

    /**
     * Cifra un dato.
     */
    public static function encrypt(string $data): string
    {
        $key = $_ENV['ENCRYPTION_KEY'] ?? 'default-32-char-key-for-aes-256!!';
        $iv  = $_ENV['ENCRYPTION_IV']  ?? '16-char-iv-default';
        
        $encrypted = openssl_encrypt($data, self::$method, $key, 0, $iv);
        return base64_encode($encrypted);
    }

    /**
     * Descifra un dato.
     */
    public static function decrypt(string $data): string
    {
        $key = $_ENV['ENCRYPTION_KEY'] ?? 'default-32-char-key-for-aes-256!!';
        $iv  = $_ENV['ENCRYPTION_IV']  ?? '16-char-iv-default';
        
        $decoded = base64_decode($data);
        return openssl_decrypt($decoded, self::$method, $key, 0, $iv);
    }
}
