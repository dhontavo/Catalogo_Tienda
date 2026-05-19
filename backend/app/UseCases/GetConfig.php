<?php

namespace App\UseCases;

use App\Domain\Config;
use App\Interfaces\ConfigRepository;

/**
 * Caso de uso: Obtener los parámetros de configuración.
 */
class GetConfig
{
    private ConfigRepository $repository;

    public function __construct(ConfigRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta el caso de uso para obtener la configuración.
     *
     * @return Config
     */
    public function execute(): Config
    {
        return $this->repository->get();
    }
}
