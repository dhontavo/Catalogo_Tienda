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
     * @param string $storeId
     * @return Product[]
     */
    public function findByStoreId(string $storeId, int $limit = 10, int $offset = 0): array;

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
     * @return string ID del producto insertado
     */
    public function save(Product $product): string;

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
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool;
}
