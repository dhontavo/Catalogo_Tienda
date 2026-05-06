<?php

namespace App\Domain;

/**
 * Entidad de dominio User.
 * Representa un usuario del sistema.
 */
class User
{
    private string $id;
    private string $name;
    private string $lastname;
    private string $birthday;
    private string $email;
    private string $username;
    private string $password;
    private string $idStore;
    private int $idPlan;
    private string $createdAt;
    private string $updateAt;

    public function __construct(
        string $name,
        string $lastname,
        string $birthday,
        string $email,
        string $username,
        string $password,
        string $idStore,
        int $idPlan = 0,
        string $id = '',
        string $createdAt = '',
        string $updateAt = ''
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->lastname = $lastname;
        $this->birthday = $birthday;
        $this->email = $email;
        $this->username = $username;
        $this->password = $password;
        $this->idStore = $idStore;
        $this->idPlan = $idPlan;
        $this->createdAt = $createdAt;
        $this->updateAt = $updateAt;
    }

    // ─── Getters ────────────────────────────────────────────

    public function getId(): string { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getLastname(): string { return $this->lastname; }
    public function getBirthday(): string { return $this->birthday; }
    public function getEmail(): string { return $this->email; }
    public function getUsername(): string { return $this->username; }
    public function getPassword(): string { return $this->password; }
    public function getIdStore(): string { return $this->idStore; }
    public function getIdPlan(): int { return $this->idPlan; }
    public function getCreatedAt(): string { return $this->createdAt; }
    public function getUpdateAt(): string { return $this->updateAt; }

    // ─── Setters ────────────────────────────────────────────

    public function setId(string $id): void { $this->id = $id; }
    public function setName(string $name): void { $this->name = $name; }
    public function setLastname(string $lastname): void { $this->lastname = $lastname; }
    public function setBirthday(string $birthday): void { $this->birthday = $birthday; }
    public function setEmail(string $email): void { $this->email = $email; }
    public function setUsername(string $username): void { $this->username = $username; }
    public function setPassword(string $password): void { $this->password = $password; }
    public function setIdStore(string $idStore): void { $this->idStore = $idStore; }
    public function setIdPlan(int $idPlan): void { $this->idPlan = $idPlan; }

    // ─── Utilidades ─────────────────────────────────────────

    /**
     * Convierte la entidad a un arreglo asociativo.
     */
    public function toArray(): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'lastname'   => $this->lastname,
            'birthday'   => $this->birthday,
            'email'      => $this->email,
            'username'   => $this->username,
            'id_store'   => $this->idStore,
            'id_plan'    => $this->idPlan,
            'created_at' => $this->createdAt,
            'update_at'  => $this->updateAt,
        ];
    }
}
