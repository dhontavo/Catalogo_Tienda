<?php

namespace App\Infrastructure;

/**
 * Utilidad para el manejo de imágenes (guardado, detección de colores).
 */
class ImageHelper
{
    /**
     * Guarda una imagen en Base64 en el servidor y detecta sus colores dominantes.
     * 
     * @param string $base64Data Imagen en formato Base64 (con o sin prefijo data:image/...)
     * @param string $subFolder Subcarpeta dentro de public/uploads/ (ej: 'logos' o 'products')
     * @return array [url, colors]
     */
    public static function processAndSaveImage(string $base64Data, string $subFolder = 'uploads'): array
    {
        if (empty($base64Data)) {
            return ['url' => null, 'colors' => null];
        }

        // 1. Decodificar la imagen
        $type = 'jpg';
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $matches)) {
            $type = strtolower($matches[1]);
            $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
        }

        $decodedData = base64_decode($base64Data);
        if (!$decodedData) {
            return ['url' => null, 'colors' => null];
        }

        // 2. Guardar archivo físico
        $fileName = uniqid() . '_' . date('Ymd_His') . '.' . $type;
        $uploadDir = __DIR__ . "/../../public/uploads/{$subFolder}/";
        
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filePath = $uploadDir . $fileName;
        file_put_contents($filePath, $decodedData);

        // 3. Detectar colores
        $colors = self::getDominantColors($filePath);

        // 4. Generar URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $url = "{$protocol}://{$host}/Catalogo_Tienda/backend/public/uploads/{$subFolder}/{$fileName}";

        return [
            'url' => $url,
            'colors' => json_encode($colors)
        ];
    }

    /**
     * Detecta los colores más dominantes de una imagen.
     */
    public static function getDominantColors(string $filePath, int $count = 5): array
    {
        // Verificar si la extensión GD está habilitada
        if (!function_exists('imagecreatetruecolor')) {
            return []; // Retornar vacío si no hay GD para evitar crash
        }

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $img = @\imagecreatefromjpeg($filePath);
                break;
            case 'png':
                $img = @\imagecreatefrompng($filePath);
                break;
            case 'webp':
                $img = @\imagecreatefromwebp($filePath);
                break;
            case 'gif':
                $img = @\imagecreatefromgif($filePath);
                break;
            default:
                return [];
        }

        if (!$img) return [];

        // Redimensionar para análisis rápido (100x100)
        $width = \imagesx($img);
        $height = \imagesy($img);
        $preview = \imagecreatetruecolor(100, 100);
        
        // Mantener transparencia si es PNG o WebP
        \imagealphablending($preview, false);
        \imagesavealpha($preview, true);
        
        \imagecopyresampled($preview, $img, 0, 0, 0, 0, 100, 100, $width, $height);

        $colors = [];
        for ($x = 0; $x < 100; $x++) {
            for ($y = 0; $y < 100; $y++) {
                $rgb = \imagecolorat($preview, $x, $y);
                
                // Si el color es transparente, lo ignoramos
                $alpha = ($rgb >> 24) & 0x7F;
                if ($alpha > 110) continue; 

                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;

                // Agrupar colores similares redondeando
                $r = floor($r / 16) * 16;
                $g = floor($g / 16) * 16;
                $b = floor($b / 16) * 16;

                $hex = sprintf("#%02x%02x%02x", $r, $g, $b);
                
                if (!isset($colors[$hex])) {
                    $colors[$hex] = 0;
                }
                $colors[$hex]++;
            }
        }

        arsort($colors);
        $topColors = array_slice(array_keys($colors), 0, $count);

        \imagedestroy($img);
        \imagedestroy($preview);

        return $topColors;
    }
}
