<?php

namespace App\UseCases;

use App\Domain\Store;
use App\Interfaces\StoreRepository;

/**
 * Caso de uso: Registrar una nueva tienda.
 */
class RegisterStore
{
    private StoreRepository $repository;

    public function __construct(StoreRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta el caso de uso.
     *
     * @param array $data Datos de la tienda (store, dialing_code, cellphone, image, colors)
     * @return string ID de la tienda creada
     */
    public function execute(array $data): string
    {
        if (empty($data['store'])) {
            throw new \InvalidArgumentException('el nombre de la tienda es obligatorio.');
        }

        // Verificar si ya existe una tienda con ese nombre
        $existing = $this->repository->findByName($data['store']);
        if ($existing !== null) {
            throw new \InvalidArgumentException('Ya existe una tienda con ese nombre.');
        }

        $store = new Store(
            $data['store'],
            $data['dialing_code'] ?? null,
            $data['cellphone'] ?? null,
            $data['image'] ?? null,
            $data['colors'] ?? null
        );

        return $this->repository->save($store);
    }
}
