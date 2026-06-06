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
    public function findByStoreId(string $storeId, int $limit = 10, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, id_store, id_user, name, description, price, image
             FROM products
             WHERE id_store = :id_store
             ORDER BY id DESC
             LIMIT :limit OFFSET :offset'
        );
        
        $stmt->bindValue(':id_store', $storeId, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $products = [];
        while ($row = $stmt->fetch()) {
            $products[] = new Product(
                (string) $row['id_store'],
                (string) ($row['id_user'] ?? ''),
                $row['name'],
                $row['description'],
                (float) $row['price'],
                $row['image'],
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
            'SELECT id, id_store, id_user, name, description, price, image
             FROM products
             WHERE id = :id'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return new Product(
            (string) $row['id_store'],
            (string) ($row['id_user'] ?? ''),
            $row['name'],
            $row['description'],
            (float) $row['price'],
            $row['image'],
            (string) $row['id']
        );
    }

    /**
     * {@inheritdoc}
     */
    public function save(Product $product): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO products (id,id_store, name, description, price, image, id_user)
             VALUES (UUID(), :id_store, :name, :description, :price, :image,:id_user)'
        );

        $stmt->execute([
            ':id_store'    => $product->getStoreId(),
            ':name'        => $product->getName(),
            ':description' => $product->getDescription(),
            ':price'       => $product->getPrice(),
            ':image'   => $product->getImageUrl(),
            ':id_user'   => $product->getIdUser(),
        ]);

        return (string) $this->db->lastInsertId();
    }

    /**
     * {@inheritdoc}
     */
    public function update(Product $product): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE products
             SET name = :name, description = :description, price = :price, image = :image
             WHERE id = :id'
        );

        return $stmt->execute([
            ':name'        => $product->getName(),
            ':description' => $product->getDescription(),
            ':price'       => $product->getPrice(),
            ':image'   => $product->getImageUrl(),
            ':id'          => $product->getId(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM products WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }

     /**
     * {@inheritdoc}
     */
    public function view(string $id): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE products
             SET view = view + 1
             WHERE id = :id'
        );

        return $stmt->execute([
            ':id'          => $id,
        ]);
    }

}
