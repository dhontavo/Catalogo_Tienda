<?php

namespace App\Infrastructure;

use PDO;
use PDOException;

/**
 * Clase Singleton para manejar la conexión a la base de datos MySQL.
 */
class Database
{
    private static ?PDO $instance = null;

    /**
     * Prevenir instanciación directa.
     */
    private function __construct() {}

    /**
     * Prevenir clonación.
     */
    private function __clone() {}

    /**
     * Obtiene la instancia única de la conexión PDO.
     *
     * @return PDO
     * @throws PDOException
     */
    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $config = require __DIR__ . '/../../config/database.php';

            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                $config['host'],
                $config['port'],
                $config['database'],
                $config['charset']
            );

            self::$instance = new PDO($dsn, $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        }

        return self::$instance;
    }
}
