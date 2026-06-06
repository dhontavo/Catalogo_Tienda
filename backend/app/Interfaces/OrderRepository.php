<?php

namespace App\Interfaces;

use App\Domain\Order;

/**
 * Interfaz para el repositorio de Pedidos.
 */
interface OrderRepository
{
    /**
     * Obtiene los pedidos actual de una tienda.
     * Si no existe ninguna fila, puede retornar un objeto Order vacío o valores por defecto.
     *
     * @return Order
     */
    public function get(string $id_store): Order;

    /**
     * Guarda un nuevo pedido y devuelve el ID generado.
     *
     * @param Order $order
     * @return string ID del pedido insertado
     */
    public function save(Order $order): string;
}