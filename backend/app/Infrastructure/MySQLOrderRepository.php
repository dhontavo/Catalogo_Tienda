<?php

namespace App\Infrastructure;

use App\Interfaces\OrderRepository;
use App\Domain\Order;

/**
 * Repositorio MySQL para la gestión de pedidos.
 */
class MySQLOrderRepository implements OrderRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
    /**
     * Obtiene los pedidos actual de una tienda.
     *
     * @param string $id_store
     * @return Order
     */
    public function get(string $id_store): Order
    {
        $stmt = $this->db->query('SELECT id, id_store, id_product, create_at FROM orders WHERE id_store = :id_store');
        $stmt->bindValue(':id_store', $id_store, PDO::PARAM_STR);
        
        $orders = [];
        while ($row = $stmt->fetch()) {
            $orders[] = new Order(
                $row['id'],
                $row['id_store'],
                $row['id_product'],
                $row['create_at']
            );
        }

        return $orders;
    }

    /**
     * Guarda un nuevo pedido.
     *
     * @param Order $order
     * @return string
     */
    public function save(Order $order): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO orders (id, id_store, id_product)
             VALUES (UUID(), :id_store, :id_product)'
        );

        $stmt->execute([
            ':id_store'    => $order->getStoreId(),
            ':id_product'    => $order->getProductId()
        ]);

        return (string) $this->db->lastInsertId();
    }
}