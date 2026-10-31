<?php

namespace App\UseCases;

use App\Interfaces\StoreRepository;

/**
 * Caso de uso: Obtener todas las tiendas disponibles.
 */
class GetStores
{
    private StoreRepository $repository;

    public function __construct(StoreRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta el caso de uso para listar todas las tiendas.
     *
     * @return array
     */
    public function execute(): array
    {
        $stores = $this->repository->findAll();

        return array_map(function ($store) {
            return $store->toArray();
        }, $stores);
    }
}
