<?php

namespace App\Controllers;

use App\Infrastructure\MySQLConfigRepository;
use App\UseCases\GetConfig;
use App\UseCases\UpdateConfig;
use App\Infrastructure\SecurityHelper;

class ConfigController
{
    private GetConfig $getConfig;
    private UpdateConfig $updateConfig;

    public function __construct()
    {
        $repository = new MySQLConfigRepository();
        $this->getConfig = new GetConfig($repository);
        $this->updateConfig = new UpdateConfig($repository);
    }

    /**
     * Obtiene los parámetros de configuración.
     */
    public function show(): void
    {
        try {
            $config = $this->getConfig->execute();
            SecurityHelper::jsonResponse([
                'success' => true,
                'data' => $config->toArray()
            ]);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error' => 'Error al obtener la configuración: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualiza los parámetros de configuración.
     */
    public function update(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if ($input === null) {
                SecurityHelper::jsonResponse([
                    'success' => false,
                    'error' => 'Cuerpo de la petición JSON no válido.'
                ], 400);
                return;
            }

            // Sanitizar entradas
            $sanitizedInput = [];
            foreach ($input as $key => $value) {
                if (is_string($value)) {
                    $sanitizedInput[$key] = SecurityHelper::sanitize($value);
                } else {
                    $sanitizedInput[$key] = $value;
                }
            }

            $config = $this->updateConfig->execute($sanitizedInput);

            SecurityHelper::jsonResponse([
                'success' => true,
                'message' => 'Configuración actualizada correctamente.',
                'data' => $config->toArray()
            ]);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error' => 'Error al actualizar la configuración: ' . $e->getMessage()
            ], 500);
        }
    }
}
