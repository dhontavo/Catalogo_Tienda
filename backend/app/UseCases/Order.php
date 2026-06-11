<?php

namespace App\UseCases;

use App\Domain\Order as OrderEntity;
use App\Interfaces\OrderRepository;

/**
 * Caso de uso: Crear una nueva orden de compra.
 */
class Order
{
    private OrderRepository $repository;

    public function __construct(OrderRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta el caso de uso: crea y persiste una orden.
     *
     * @param string $idStore   ID de la tienda
     * @param string $idProduct ID del producto
     * @return array Orden creada serializada
     * @throws \InvalidArgumentException Si los datos son inválidos
     */
    public function execute(string $idStore, string $idProduct): array
    {
        if (empty(trim($idStore))) {
            throw new \InvalidArgumentException('El ID de la tienda es obligatorio.');
        }

        if (empty(trim($idProduct))) {
            throw new \InvalidArgumentException('El ID del producto es obligatorio.');
        }

        $order = new OrderEntity('', $idStore, $idProduct);
        $this->repository->save($order);

        return $order->toArray();
    }
}
