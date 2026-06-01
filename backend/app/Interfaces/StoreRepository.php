<?php

namespace App\Interfaces;

use App\Domain\Store;

/**
 * Interfaz para el repositorio de tiendas.
 */
interface StoreRepository
{
    public function save(Store $store): string;
    public function findById(string $id): ?Store;
    public function findByName(string $name): ?Store;
    public function update(Store $store): bool;
    public function findAll(): array;
}
