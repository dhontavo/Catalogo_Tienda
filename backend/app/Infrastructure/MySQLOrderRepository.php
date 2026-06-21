<?php

namespace App\Infrastructure;

use App\Interfaces\OrderRepository;
use App\Domain\Order;
use PDO;

/**
 * Repositorio MySQL para la gestión de pedidos.
 */
class MySQLOrderRepository implements OrderRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Obtiene los pedidos de una tienda.
     *
     * @param string $id_store
     * @return array
     */
    public function get(string $id_store): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, id_store, id_product, create_at FROM orders WHERE id_store = :id_store'
        );
        $stmt->execute([':id_store' => $id_store]);

        $orders = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
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
            ':id_store'   => $order->getStoreId(),
            ':id_product' => $order->getProductId()
        ]);

        return (string) $this->db->lastInsertId();
    }
}