<?php

namespace App\Infrastructure;

use App\Domain\User;
use App\Interfaces\UserRepository;
use PDO;

/**
 * Implementación MySQL del repositorio de usuarios.
 */
class MySQLUserRepository implements UserRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * {@inheritdoc}
     */
    public function findById(string $id): ?User
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, lastname, birthday, email, username, password, id_store, id_plan, created_at, update_at
             FROM users
             WHERE id = :id'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return $this->mapRowToUser($row);
    }

    /**
     * {@inheritdoc}
     */
    public function findByUsername(string $username): ?User
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, lastname, birthday, email, username, password, id_store, id_plan, created_at, update_at
             FROM users
             WHERE username = :username'
        );
        $stmt->execute([':username' => $username]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return $this->mapRowToUser($row);
    }

    /**
     * {@inheritdoc}
     */
    public function save(User $user): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (id, name, lastname, birthday, email, username, password, id_store, id_plan)
             VALUES (UUID(), :name, :lastname, :birthday, :email, :username, :password, :id_store, :id_plan)'
        );

        $stmt->execute([
            ':name'     => $user->getName(),
            ':lastname' => $user->getLastname(),
            ':birthday' => $user->getBirthday(),
            ':email'    => $user->getEmail(),
            ':username' => $user->getUsername(),
            ':password' => $user->getPassword(),
            ':id_store' => $user->getIdStore(),
            ':id_plan'  => $user->getIdPlan()
        ]);

        // Recuperar el UUID generado (en MySQL 8 con DEFAULT uuid() se podría omitir UUID() en el INSERT)
        $stmt = $this->db->prepare(
            'SELECT id FROM users WHERE username = :username'
        );
        $stmt->execute([':username' => $user->getUsername()]);
        $row = $stmt->fetch();

        return $row ? (string) $row['id'] : '';
    }

    /**
     * Mapea una fila de la base de datos a la entidad User.
     */
    private function mapRowToUser(array $row): User
    {
        return new User(
            $row['name'],
            $row['lastname'],
            $row['birthday'],
            $row['email'],
            $row['username'],
            $row['password'],
            $row['id_store'],
            (int) ($row['id_plan'] ?? 0),
            (string) $row['id'],
            $row['created_at'],
            $row['update_at']
        );
    }
}
