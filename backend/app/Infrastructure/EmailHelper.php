<?php

namespace App\Infrastructure;

/**
 * Clase para gestionar las plantillas de correo electrónico.
 */
class EmailHelper
{
    /**
     * Genera el HTML para el correo de contraseña temporal.
     * 
     * @param string $userName Nombre del usuario
     * @param string $tempPassword Contraseña temporal generada
     * @return string HTML completo del correo
     */
    public static function getTemporaryPasswordTemplate(string $userName, string $tempPassword): string
    {
        // 1. Obtener la configuración de la tienda desde la tabla config
        $configRepo = new \App\Infrastructure\MySQLConfigRepository();
        $config = $configRepo->get();

        $storeName = $config->getName() ?: 'ShoppyCatalog';
        $logo = $config->getLogo();
        
        // 2. Fallback del logo si no está configurado o es una ruta vacía/inválida
        if (empty($logo) || filter_var($logo, FILTER_VALIDATE_URL) === false && strpos($logo, 'data:image') !== 0) {
            // Si el logo tiene un valor de ruta relativa que existe, construir la URL completa
            if (!empty($logo) && file_exists(__DIR__ . '/../../public/' . $logo)) {
                $logo = 'http://localhost/Catalogo_Tienda/backend/public/' . $logo;
            } else {
                // Fallback por defecto elegante (Favicon oficial)
                $logo = 'https://shoppycatalog.com/assets/icon/favicon.png';
            }
        }

        // 3. Cargar la plantilla HTML
        $templatePath = __DIR__ . '/templates/email_temp_password.html';
        if (file_exists($templatePath)) {
            $html = file_get_contents($templatePath);
        } else {
            // Fallback de contingencia si el archivo no existe por alguna razón
            return "
            <!DOCTYPE html>
            <html>
            <body style='font-family: sans-serif; text-align: center; padding: 40px;'>
                <img src='{$logo}' style='width: 80px; height: 80px; border-radius: 15px;'>
                <h2>Recuperación de Contraseña - {$storeName}</h2>
                <p>Hola <strong>{$userName}</strong>,</p>
                <p>Tu contraseña temporal es: <strong style='font-size: 20px; background: #eee; padding: 5px 10px; border-radius: 5px;'>{$tempPassword}</strong></p>
                <p>Por favor cámbiala al iniciar sesión.</p>
            </body>
            </html>";
        }

        // 4. Determinar dominio y login URL
        $domain = 'http://localhost/Catalogo_Tienda/backend/public/';
        $loginUrl = 'http://localhost/Catalogo_Tienda/backend/public/login'; // Se puede ajustar al login de tu app o frontend

        // 5. Reemplazar todos los marcadores en la plantilla
        $html = str_replace('{{name}}', htmlspecialchars($userName), $html);
        $html = str_replace('{{password}}', htmlspecialchars($tempPassword), $html);
        $html = str_replace('{{logo}}', $logo, $html);
        $html = str_replace('{{domain}}', $domain, $html);
        $html = str_replace('{{login_url}}', $loginUrl, $html);
        
        // Reemplazar también cualquier mención estática de ShoppyCatalog por el nombre real de la tienda
        if ($storeName !== 'ShoppyCatalog') {
            $html = str_replace('ShoppyCatalog', htmlspecialchars($storeName), $html);
            $html = str_replace('Shoppy<span>Catalog</span>', htmlspecialchars($storeName), $html);
        }

        return $html;
    }
}
