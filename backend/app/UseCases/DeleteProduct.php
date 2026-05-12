<?php

namespace App\UseCases;

use App\Interfaces\ProductRepository;

class DeleteProduct
{
    private ProductRepository $repository;

    public function __construct(ProductRepository $repository)
    {
        $this->repository = $repository;
    }

    public function execute(string $id): bool
    {
        $product = $this->repository->findById($id);
        if (!$product) {
            throw new \InvalidArgumentException("El producto con ID {$id} no existe.");
        }

        return $this->repository->delete($id);
    }
}
