<?php

namespace App\UseCases;

use App\Domain\User;
use App\Interfaces\UserRepository;

/**
 * Caso de uso: Registrar un nuevo usuario.
 */
class RegisterUser
{
    private UserRepository $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Ejecuta el caso de uso.
     *
     * @param string $username Nombre de usuario
     * @param string $password Contraseña en texto plano
     * @return array Usuario creado serializado
     */
    public function execute(string $username, string $password): array
    {
        // Validaciones de dominio
        if (empty(trim($username))) {
            throw new \InvalidArgumentException('El nombre de usuario es obligatorio.');
        }

        if (strlen($username) < 3) {
            throw new \InvalidArgumentException('El nombre de usuario debe tener al menos 3 caracteres.');
        }

        if (strlen($password) < 6) {
            throw new \InvalidArgumentException('La contraseña debe tener al menos 6 caracteres.');
        }

        // Verificar que el username no esté en uso
        $existing = $this->repository->findByUsername($username);
        if ($existing !== null) {
            throw new \InvalidArgumentException('El nombre de usuario ya está en uso.');
        }

        // Hashear la contraseña antes de guardar
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $user = new User($username, $hashedPassword);
        $id = $this->repository->save($user);

        // Recuperar el usuario con su ID asignado
        $saved = $this->repository->findById($id);

        return $saved ? $saved->toArray() : $user->toArray();
    }
}
