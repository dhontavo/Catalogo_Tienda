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
     * @param array $data Datos del usuario (name, lastname, birthday, email, username, password, id_store)
     * @return array Usuario creado serializado
     */
    public function execute(array $data): array
    {
        // Validaciones básicas
        $requiredFields = ['name', 'lastname', 'birthday', 'email', 'username', 'password', 'id_store'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("El campo '$field' es obligatorio.");
            }
        }

        if (strlen($data['username']) < 3) {
            throw new \InvalidArgumentException('El nombre de usuario debe tener al menos 3 caracteres.');
        }

        if (strlen($data['password']) < 6) {
            throw new \InvalidArgumentException('La contraseña debe tener al menos 6 caracteres.');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('El formato del correo electrónico es inválido.');
        }

        // Verificar que el username no esté en uso
        $existing = $this->repository->findByUsername($data['username']);
        if ($existing !== null) {
            throw new \InvalidArgumentException('El nombre de usuario ya está en uso.');
        }

        // Hashear la contraseña antes de guardar
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);

        $user = new User(
            $data['name'],
            $data['lastname'],
            $data['birthday'],
            $data['email'],
            $data['username'],
            $hashedPassword,
            $data['id_store'],
            $data['id_plan'] ?? 0
        );

        $id = $this->repository->save($user);

        // Recuperar el usuario con su ID asignado y campos generados por DB
        $saved = $this->repository->findById($id);

        return $saved ? $saved->toArray() : $user->toArray();
    }
}
