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
            'SELECT us.id, name, lastname, birthday, email, username, password, id_store, id_plan, st.store, st.dialing_code, st.cellphone, st.image, st.colors
             FROM users AS us LEFT JOIN stores AS st on us.id_store = st.id
             WHERE us.id = :id'
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
            'SELECT us.id, name, lastname, birthday, email, username, password, id_store, id_plan, st.`store`, st.dialing_code, st.cellphone, st.image, st.colors
             FROM users AS us LEFT JOIN stores AS st on us.id_store = st.id
             WHERE us.username = :username'
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
    public function findByEmail(string $email): ?User
    {
        $stmt = $this->db->prepare(
            'SELECT us.id, name, lastname, birthday, email, username, password, id_store, id_plan, st.store, st.dialing_code, st.cellphone, st.image, st.colors
             FROM users AS us LEFT JOIN stores AS st on us.id_store = st.id
             WHERE us.email = :email'
        );
        $stmt->execute([':email' => $email]);
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

    public function update(User $user): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET 
                name = :name, 
                lastname = :lastname, 
                birthday = :birthday, 
                email = :email, 
                username = :username,
                password = :password,
                id_plan = :id_plan
             WHERE id = :id'
        );

        return $stmt->execute([
            ':name'     => $user->getName(),
            ':lastname' => $user->getLastname(),
            ':birthday' => $user->getBirthday(),
            ':email'    => $user->getEmail(),
            ':username' => $user->getUsername(),
            ':password' => $user->getPassword(),
            ':id_plan'  => $user->getIdPlan(),
            ':id'       => $user->getId()
        ]);
    }

    /**
     * Mapea una fila de la base de datos a la entidad User.
     */
    private function mapRowToUser(array $row): User
    {
        $user = new User(
            $row['name'],
            $row['lastname'],
            $row['birthday'],
            $row['email'],
            $row['username'],
            $row['password'],
            $row['id_store'],
            (int) ($row['id_plan'] ?? 0),
            (string) $row['id'],
            $row['created_at'] ?? '',
            $row['update_at'] ?? ''
        );

        $user->setExtraData([
            'store'        => $row['store'] ?? null,
            'dialing_code' => $row['dialing_code'] ?? null,
            'cellphone'    => $row['cellphone'] ?? null,
            'store_image'  => $row['image'] ?? null,
            'colors'       => $row['colors'] ?? null
        ]);

        return $user;
    }
}

