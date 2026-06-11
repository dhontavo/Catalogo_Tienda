<?php

namespace App\Interfaces;

use App\Domain\Order;

/**
 * Interfaz para el repositorio de Pedidos.
 */
interface OrderRepository
{
    /**
     * Obtiene los pedidos de una tienda.
     *
     * @param string $id_store ID de la tienda
     * @return array Lista de objetos Order
     */
    public function get(string $id_store): array;

    /**
     * Guarda un nuevo pedido y devuelve el ID generado.
     *
     * @param Order $order
     * @return string ID del pedido insertado
     */
    public function save(Order $order): string;
}