<?php

namespace App\UseCases;

use App\Interfaces\ProductRepository;
use App\Domain\Product;

class UpdateProduct
{
    private ProductRepository $repository;

    public function __construct(ProductRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta la actualización de un producto.
     */
    public function execute(string $id, string $name, string $description, float $price, string $imageUrl): bool
    {
        $product = $this->repository->findById($id);
        if (!$product) {
            throw new \InvalidArgumentException("El producto con ID {$id} no existe.");
        }

        // Crear una nueva instancia con los datos actualizados
        $updatedProduct = new Product(
            $product->getStoreId(),
            $product->getIdUser(),
            $name,
            $description,
            $price,
            $imageUrl, // Ahora usamos la nueva URL
            $id
        );

        return $this->repository->update($updatedProduct);
    }
}
