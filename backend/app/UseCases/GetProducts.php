<?php

namespace App\UseCases;

use App\Interfaces\ProductRepository;

/**
 * Caso de uso: Obtener productos de una tienda.
 */
class GetProducts
{
    private ProductRepository $repository;

    public function __construct(ProductRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta el caso de uso.
     *
     * @param string $storeId ID de la tienda
     * @return array Arreglo de productos serializados
     */
    public function execute(string $storeId): array
    {
        $products = $this->repository->findByStoreId($storeId);

        return array_map(function ($product) {
            return $product->toArray();
        }, $products);
    }
}
