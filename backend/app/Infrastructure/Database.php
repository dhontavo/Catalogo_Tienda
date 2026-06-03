<?php

namespace App\Infrastructure;

use PDO;
use PDOException;
use PDOStatement;

class LoggedPDOStatement extends PDOStatement
{
    protected function __construct() {}

    public function execute(?array $params = null): bool
    {
        $paramStr = $params ? json_encode($params) : 'No Params';
        Logger::log("Executing SQL: " . $this->queryString . " | Params: " . $paramStr, 'DB');
        return parent::execute($params);
    }
}

class LoggedPDO extends PDO
{
    public function __construct($dsn, $username, $password, $options)
    {
        parent::__construct($dsn, $username, $password, $options);
        $this->setAttribute(PDO::ATTR_STATEMENT_CLASS, [LoggedPDOStatement::class]);
    }

    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchmodeArgs): PDOStatement|false
    {
        Logger::log("Executing Query: " . $query, 'DB');
        return parent::query(...func_get_args());
    }

    public function exec(string $statement): int|false
    {
        Logger::log("Executing Exec: " . $statement, 'DB');
        return parent::exec($statement);
    }
}

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

            self::$instance = new LoggedPDO($dsn, $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        }

        return self::$instance;
    }
}
