<?php

namespace App\UseCases;

use App\Interfaces\ProductRepository;

/**
 * Caso de uso: Obtener productos de una tienda o un producto individual.
 */
class GetProducts
{
    private ProductRepository $repository;

    public function __construct(ProductRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta el caso de uso para listar productos de una tienda.
     */
    public function execute(string $storeId, int $limit = 10, int $offset = 0): array
    {
        $products = $this->repository->findByStoreId($storeId, $limit, $offset);

        return array_map(function ($product) {
            return $product->toArray();
        }, $products);
    }

    /**
     * Obtiene un producto individual por su ID para edición o detalle.
     */
    public function findById(string $id): ?array
    {
        $product = $this->repository->findById($id);
        return $product ? $product->toArray() : null;
    }
}
