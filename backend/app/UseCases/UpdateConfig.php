<?php

namespace App\UseCases;

use App\Domain\Config;
use App\Interfaces\ConfigRepository;

/**
 * Caso de uso: Actualizar los parámetros de configuración.
 */
class UpdateConfig
{
    private ConfigRepository $repository;

    public function __construct(ConfigRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta el caso de uso para actualizar la configuración.
     *
     * @param array $data Nuevos datos de configuración
     * @return Config
     */
    public function execute(array $data): Config
    {
        $currentConfig = $this->repository->get();

        if (isset($data['name'])) $currentConfig->setName($data['name']);
        if (isset($data['email'])) {
            if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException('El correo electrónico de configuración no es válido.');
            }
            $currentConfig->setEmail($data['email']);
        }
        if (isset($data['password'])) $currentConfig->setPassword($data['password']);
        if (isset($data['port'])) {
            $port = $data['port'] !== null ? (int)$data['port'] : null;
            $currentConfig->setPort($port);
        }
        if (isset($data['api_whatsapp'])) $currentConfig->setApiWhatsapp($data['api_whatsapp']);
        if (isset($data['logo'])) $currentConfig->setLogo($data['logo']);
        if (isset($data['logo_path'])) $currentConfig->setLogoPath($data['logo_path']);
        if (isset($data['product_path'])) $currentConfig->setProductPath($data['product_path']);

        $success = $this->repository->update($currentConfig);

        if (!$success) {
            throw new \RuntimeException('Error al guardar la configuración en la base de datos.');
        }

        return $currentConfig;
    }
}
