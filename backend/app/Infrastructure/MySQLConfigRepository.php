<?php

namespace App\Infrastructure;

use App\Domain\Config;
use App\Interfaces\ConfigRepository;
use PDO;

/**
 * Implementación MySQL para el repositorio de configuración.
 */
class MySQLConfigRepository implements ConfigRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * {@inheritdoc}
     */
    public function get(): Config
    {
        $stmt = $this->db->prepare('SELECT * FROM config LIMIT 1');
        $stmt->execute();
        $row = $stmt->fetch();

        if (!$row) {
            // Retorna una configuración por defecto si la tabla está vacía
            return new Config(
                'ShoppyCatalog',
                'admin@shoppycatalog.com',
                '',
                587,
                '',
                '',
                'uploads/logos/',
                'uploads/products/'
            );
        }

        return new Config(
            $row['name'],
            $row['email'],
            $row['password'],
            $row['port'] !== null ? (int)$row['port'] : null,
            $row['api_whatsapp'],
            $row['logo'],
            $row['logo_path'],
            $row['product_path']
        );
    }

    /**
     * {@inheritdoc}
     */
    public function update(Config $config): bool
    {
        // Verificar si ya existe una fila de configuración
        $stmt = $this->db->prepare('SELECT COUNT(*) as total FROM config');
        $stmt->execute();
        $row = $stmt->fetch();
        $exists = ($row && $row['total'] > 0);

        if ($exists) {
            $stmt = $this->db->prepare(
                'UPDATE config SET 
                    `name` = :name, 
                    email = :email, 
                    password = :password, 
                    port = :port, 
                    api_whatsapp = :api_whatsapp, 
                    logo = :logo, 
                    logo_path = :logo_path, 
                    product_path = :product_path'
            );
        } else {
            $stmt = $this->db->prepare(
                'INSERT INTO config (`name`, email, password, port, api_whatsapp, logo, logo_path, product_path)
                 VALUES (:name, :email, :password, :port, :api_whatsapp, :logo, :logo_path, :product_path)'
            );
        }

        return $stmt->execute([
            ':name'         => $config->getName(),
            ':email'        => $config->getEmail(),
            ':password'     => $config->getPassword(),
            ':port'         => $config->getPort(),
            ':api_whatsapp' => $config->getApiWhatsapp(),
            ':logo'         => $config->getLogo(),
            ':logo_path'    => $config->getLogoPath(),
            ':product_path' => $config->getProductPath()
        ]);
    }
}
