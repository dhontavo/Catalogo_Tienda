<?php

namespace App\Interfaces;

use App\Domain\Product;

/**
 * Contrato (interfaz) del repositorio de productos.
 * Define las operaciones que cualquier implementación de persistencia debe cumplir.
 */
interface ProductRepository
{
    /**
     * Obtiene todos los productos de una tienda.
     *
     * @param int $storeId
     * @return Product[]
     */
    public function findByStoreId(int $storeId): array;

    /**
     * Obtiene un producto por su ID.
     *
     * @param string $id
     * @return Product|null
     */
    public function findById(string $id): ?Product;

    /**
     * Guarda un nuevo producto y devuelve el ID generado.
     *
     * @param Product $product
     * @return int ID del producto insertado
     */
    public function save(Product $product): int;

    /**
     * Actualiza un producto existente.
     *
     * @param Product $product
     * @return bool
     */
    public function update(Product $product): bool;

    /**
     * Elimina un producto por su ID.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;
}
