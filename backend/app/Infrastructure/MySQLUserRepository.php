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
            'SELECT id, username, password, created_at
             FROM users
             WHERE id = :id'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return new User(
            $row['username'],
            $row['password'],
            (string) $row['id'],
            $row['created_at']
        );
    }

    /**
     * {@inheritdoc}
     */
    public function findByUsername(string $username): ?User
    {
        $stmt = $this->db->prepare(
            'SELECT id, username, password, created_at
             FROM users
             WHERE username = :username'
        );
        $stmt->execute([':username' => $username]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return new User(
            $row['username'],
            $row['password'],
            (string) $row['id'],
            $row['created_at']
        );
    }

    /**
     * {@inheritdoc}
     */
    public function save(User $user): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (id, username, password)
             VALUES (UUID(), :username, :password)'
        );

        $stmt->execute([
            ':username' => $user->getUsername(),
            ':password' => $user->getPassword(),
        ]);

        // Recuperar el UUID generado
        $stmt = $this->db->prepare(
            'SELECT id FROM users WHERE username = :username'
        );
        $stmt->execute([':username' => $user->getUsername()]);
        $row = $stmt->fetch();

        return $row ? (string) $row['id'] : '';
    }
}
