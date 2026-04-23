<?php

namespace App\UseCases;

use App\Domain\Product;
use App\Interfaces\ProductRepository;

/**
 * Caso de uso: Crear un nuevo producto.
 */
class CreateProduct
{
    private ProductRepository $repository;

    public function __construct(ProductRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta el caso de uso.
     *
     * @param int    $storeId     ID de la tienda
     * @param string $name        Nombre del producto
     * @param string $description Descripción del producto
     * @param float  $price       Precio del producto
     * @param string $imageUrl    URL de la imagen
     * @return array Producto creado serializado
     */
    public function execute(
        int $storeId,
        string $name,
        string $description,
        float $price,
        string $imageUrl
    ): array {
        // Validaciones de dominio
        if (empty(trim($name))) {
            throw new \InvalidArgumentException('El nombre del producto es obligatorio.');
        }

        if ($price < 0) {
            throw new \InvalidArgumentException('El precio no puede ser negativo.');
        }

        $product = new Product($storeId, $name, $description, $price, $imageUrl);
        $id = $this->repository->save($product);

        // Recuperar el producto con su ID asignado
        $saved = $this->repository->findById($id);

        return $saved ? $saved->toArray() : $product->toArray();
    }
}
