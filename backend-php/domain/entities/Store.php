<?php
class User {
    private int $id;
    private string $name;
    private string $email;
    private string $api_key;
    private ?string $created_at;
    private ?string $cellPhone;

    // Constructor
    public function __construct(
        int $id = 0,
        string $name = "",
        string $email = "",
        string $api_key = "",
        ?string $created_at = null,
        ?string $cellPhone = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->api_key = $api_key;
        $this->created_at = $created_at;
        $this->cellPhone = $cellPhone;
    }

    // Getters
    public function getId(): int {
        return $this->id;
    }

    public function getName(): string {
        return $this->name;
    }

    public function getEmail(): string {
        return $this->email;
    }

    public function getApiKey(): string {
        return $this->api_key;
    }

    public function getCreatedAt(): ?string {
        return $this->created_at;
    }

    public function getCellPhone(): ?string {
        return $this->cellPhone;
    }

    // Setters
    public function setName(string $name): void {
        $this->name = $name;
    }

    public function setEmail(string $email): void {
        $this->email = $email;
    }

    public function setApiKey(string $api_key): void {
        $this->api_key = $api_key;
    }

    public function setCreatedAt(?string $created_at): void {
        $this->created_at = $created_at;
    }

    public function setCellPhone(?string $cellPhone): void {
        $this->cellPhone = $cellPhone;
    }
}
