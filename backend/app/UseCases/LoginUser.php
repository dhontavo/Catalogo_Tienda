<?php

namespace App\UseCases;

use App\Infrastructure\JWTHelper;
use App\Interfaces\UserRepository;

/**
 * Caso de uso: Autenticar un usuario (login).
 */
class LoginUser
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
     * @return array Usuario autenticado con su token JWT
     */
    public function execute(string $username, string $password): array
    {
        // Validaciones básicas
        if (empty(trim($username)) || empty(trim($password))) {
            throw new \InvalidArgumentException('El usuario y la contraseña son obligatorios.');
        }

        // Buscar usuario
        $user = $this->repository->findByUsername($username);

        if ($user === null) {
            throw new \InvalidArgumentException('Credenciales inválidas.');
        }

        // Verificar contraseña
        if (!password_verify($password, $user->getPassword())) {
            throw new \InvalidArgumentException('Credenciales inválidas.');
        }

        $userData = $user->toArray();
        
        // Generar JWT (expira en 2 horas)
        $token = JWTHelper::generate([
            'sub'      => $user->getId(),
            'username' => $user->getUsername(),
            'iat'      => time(),
            'exp'      => time() + (2 * 60 * 60) 
        ]);

        return [
            'user'  => $userData,
            'token' => $token
        ];
    }
}

