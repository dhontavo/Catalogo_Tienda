<?php

namespace App\Infrastructure;

use PDO;

/**
 * Repositorio para gestionar las contraseñas temporales en la tabla tmp_pass.
 */
class MySQLTemporaryPasswordRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Guarda una contraseña temporal para un usuario.
     * 
     * @param string $idUser ID del usuario
     * @param string $password Contraseña temporal
     * @param int $minutes Tiempo de expiración en minutos
     * @return bool
     */
    public function save(string $idUser, string $password, int $minutes = 10): bool
    {
        // El tiempo de expiración es el timestamp actual + minutos en segundos
        $expiration = time() + ($minutes * 60);

        $stmt = $this->db->prepare(
            'INSERT INTO tmp_pass (pass, exp, id_user, date)
             VALUES (:pass, :exp, :id_user, NOW())'
        );

        return $stmt->execute([
            ':pass'    => $password,
            ':exp'     => $expiration,
            ':id_user' => $idUser
        ]);
    }

    /**
     * Verifica si existe una contraseña temporal válida para un usuario.
     */
    public function findValid(string $idUser, string $password): bool
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM tmp_pass 
             WHERE id_user = :id_user AND pass = :pass AND exp > :now
             ORDER BY date DESC LIMIT 1'
        );

        $stmt->execute([
            ':id_user' => $idUser,
            ':pass'    => $password,
            ':now'     => time()
        ]);

        return (bool) $stmt->fetch();
    }

    /**
     * Elimina las contraseñas temporales de un usuario.
     */
    public function deleteForUser(string $idUser): bool
    {
        $stmt = $this->db->prepare('DELETE FROM tmp_pass WHERE id_user = :id_user');
        return $stmt->execute([':id_user' => $idUser]);
    }
}
