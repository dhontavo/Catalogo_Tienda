<?php

namespace App\Domain;

/**
 * Entidad de dominio User.
 * Representa un usuario del sistema.
 */
class User
{
    private string $id;
    private string $username;
    private string $password;
    private string $createdAt;

    public function __construct(
        string $username,
        string $password,
        string $id = '',
        string $createdAt = ''
    ) {
        $this->id = $id;
        $this->username = $username;
        $this->password = $password;
        $this->createdAt = $createdAt;
    }

    // ─── Getters ────────────────────────────────────────────

    public function getId(): string
    {
        return $this->id;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getCreatedAt(): string
    {
        return $this->createdAt;
    }

    // ─── Setters ────────────────────────────────────────────

    public function setId(string $id): void
    {
        $this->id = $id;
    }

    public function setUsername(string $username): void
    {
        $this->username = $username;
    }

    public function setPassword(string $password): void
    {
        $this->password = $password;
    }

    // ─── Utilidades ─────────────────────────────────────────

    /**
     * Convierte la entidad a un arreglo asociativo.
     */
    public function toArray(): array
    {
        return [
            'id'         => $this->id,
            'username'   => $this->username,
            'created_at' => $this->createdAt,
        ];
    }
}
