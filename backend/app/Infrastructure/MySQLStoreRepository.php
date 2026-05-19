<?php

namespace App\Infrastructure;

use App\Domain\Store;
use App\Interfaces\StoreRepository;
use PDO;

class MySQLStoreRepository implements StoreRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function save(Store $store): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO stores (id, `store`, dialing_code, cellphone, image, colors)
             VALUES (UUID(), :store, :dialing_code, :cellphone, :image, :colors)'
        );

        $stmt->execute([
            ':store'        => $store->getStoreName(),
            ':dialing_code' => $store->getDialingCode(),
            ':cellphone'    => $store->getCellphone(),
            ':image'        => $store->getImage(),
            ':colors'       => $store->getColors(),
        ]);

        // Recuperar el UUID generado
        $stmt = $this->db->prepare('SELECT id FROM stores WHERE `store` = :store ORDER BY id DESC LIMIT 1');
        $stmt->execute([':store' => $store->getStoreName()]);
        $row = $stmt->fetch();

        return $row ? $row['id'] : '';
    }

    public function findById(string $id): ?Store
    {
        $stmt = $this->db->prepare('SELECT * FROM stores WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) return null;

        return new Store(
            $row['store'],
            $row['dialing_code'],
            $row['cellphone'],
            $row['image'],
            $row['colors'],
            $row['id']
        );
    }

    public function findByName(string $name): ?Store
    {
        $stmt = $this->db->prepare('SELECT * FROM stores WHERE `store` = :store');
        $stmt->execute([':store' => $name]);
        $row = $stmt->fetch();

        if (!$row) return null;

        return new Store(
            $row['store'],
            $row['dialing_code'],
            $row['cellphone'],
            $row['image'],
            $row['colors'],
            $row['id']
        );
    }

    public function update(Store $store): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE stores SET 
                `store` = :store, 
                dialing_code = :dialing_code, 
                cellphone = :cellphone, 
                image = :image, 
                colors = :colors 
             WHERE id = :id'
        );

        return $stmt->execute([
            ':store'        => $store->getStoreName(),
            ':dialing_code' => $store->getDialingCode(),
            ':cellphone'    => $store->getCellphone(),
            ':image'        => $store->getImage(),
            ':colors'       => $store->getColors(),
            ':id'           => $store->getId(),
        ]);
    }
}
