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

    public function execute(string $id, string $name, string $description, float $price): bool
    {
        $product = $this->repository->findById($id);
        if (!$product) {
            throw new \InvalidArgumentException("El producto con ID {$id} no existe.");
        }

        // Crear una nueva instancia con los datos actualizados conservando el storeId, userId e imagen actual
        $updatedProduct = new Product(
            $product->getStoreId(),
            $product->getIdUser(),
            $name,
            $description,
            $price,
            $product->getImageUrl(),
            $id
        );

        return $this->repository->update($updatedProduct);
    }
}
