<?php

namespace App\Infrastructure;

class Logger
{
    /**
     * Escribe un mensaje en el archivo de log.
     * Inserta el registro más reciente al principio del archivo.
     *
     * @param string $message El mensaje a registrar.
     * @param string $level   El nivel del log (INFO, ERROR, WARNING, etc.).
     */
    public static function log(string $message, string $level = 'ERROR'): void
    {
        // Definir la ruta del archivo (en la raíz del backend, carpeta logs)
        $logDir = __DIR__ . '/../../../logs';
        $logFile = $logDir . '/app.log';

        // Crear el directorio si no existe
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }

        // Crear la fecha y hora actual
        $date = date('Y-m-d H:i:s');
        
        // Formatear el nuevo registro
        $newLogEntry = "[$date] [$level]: $message" . PHP_EOL;

        // Leer el contenido actual del archivo (si existe)
        $currentContent = '';
        if (file_exists($logFile)) {
            $currentContent = file_get_contents($logFile);
        }

        // Sobrescribir el archivo: Nuevo Registro + Contenido Anterior
        // Esto asegura que el último evento esté siempre en la línea 1
        file_put_contents($logFile, $newLogEntry . $currentContent);
    }
}
