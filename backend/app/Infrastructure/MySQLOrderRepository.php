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
            'SELECT o.id, o.id_store, o.id_product, o.create_at,
                    p.name AS product_name, p.price AS product_price, p.image AS product_image
             FROM orders o
             LEFT JOIN products p ON o.id_product = p.id
             WHERE o.id_store = :id_store
             ORDER BY o.create_at DESC'
        );
        $stmt->execute([':id_store' => $id_store]);

        $orders = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $productDetails = null;
            if (!empty($row['product_name'])) {
                $productDetails = [
                    'name'  => $row['product_name'],
                    'price' => isset($row['product_price']) ? (float)$row['product_price'] : 0.0,
                    'image' => $row['product_image'] ?? null,
                ];
            }

            $orders[] = new Order(
                (string)$row['id'],
                (string)$row['id_store'],
                (string)$row['id_product'],
                (string)($row['create_at'] ?? ''),
                $productDetails
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