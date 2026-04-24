<?php

namespace App\Interfaces;

use App\Domain\User;

/**
 * Contrato (interfaz) del repositorio de usuarios.
 * Define las operaciones que cualquier implementación de persistencia debe cumplir.
 */
interface UserRepository
{
    /**
     * Busca un usuario por su ID.
     *
     * @param string $id
     * @return User|null
     */
    public function findById(string $id): ?User;

    /**
     * Busca un usuario por su nombre de usuario.
     *
     * @param string $username
     * @return User|null
     */
    public function findByUsername(string $username): ?User;

    /**
     * Guarda un nuevo usuario.
     *
     * @param User $user
     * @return string ID del usuario insertado
     */
    public function save(User $user): string;
}
