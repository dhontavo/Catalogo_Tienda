<?php

namespace App\Infrastructure;

use App\Domain\Product;
use App\Interfaces\ProductRepository;
use PDO;

/**
 * Implementación MySQL del repositorio de productos.
 */
class MySQLProductRepository implements ProductRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * {@inheritdoc}
     */
    public function findByStoreId(int $storeId): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, id_store, name, description, price, image_url
             FROM products
             WHERE id_store = :id_store
             ORDER BY id DESC'
        );
        $stmt->execute([':id_store' => $storeId]);

        $products = [];
        while ($row = $stmt->fetch()) {
            $products[] = new Product(
                (int) $row['id_store'],
                $row['name'],
                $row['description'],
                (float) $row['price'],
                $row['image_url'],
                (string) $row['id']
            );
        }

        return $products;
    }

    /**
     * {@inheritdoc}
     */
    public function findById(string $id): ?Product
    {
        $stmt = $this->db->prepare(
            'SELECT id, id_store, name, description, price, image_url
             FROM products
             WHERE id = :id'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return new Product(
            (int) $row['id_store'],
            $row['name'],
            $row['description'],
            (float) $row['price'],
            $row['image_url'],
            (string) $row['id']
        );
    }

    /**
     * {@inheritdoc}
     */
    public function save(Product $product): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO products (id,id_store, name, description, price, image_url)
             VALUES (UUID(), :id_store, :name, :description, :price, :image_url)'
        );

        $stmt->execute([
            ':id_store'    => $product->getStoreId(),
            ':name'        => $product->getName(),
            ':description' => $product->getDescription(),
            ':price'       => $product->getPrice(),
            ':image_url'   => $product->getImageUrl(),
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * {@inheritdoc}
     */
    public function update(Product $product): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE products
             SET name = :name, description = :description, price = :price, image_url = :image_url
             WHERE id = :id'
        );

        return $stmt->execute([
            ':name'        => $product->getName(),
            ':description' => $product->getDescription(),
            ':price'       => $product->getPrice(),
            ':image_url'   => $product->getImageUrl(),
            ':id'          => $product->getId(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM products WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }
}
