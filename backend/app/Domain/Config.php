<?php

namespace App\Domain;

/**
 * Entidad de dominio Config.
 */
class Config
{
    private ?string $name;
    private ?string $email;
    private ?string $password;
    private ?int $port;
    private ?string $apiWhatsapp;
    private string $logo;
    private string $logoPath;
    private string $productPath;
    private string $host;

    public function __construct(
        ?string $name = null,
        ?string $email = null,
        ?string $password = null,
        ?int $port = null,
        ?string $apiWhatsapp = null,
        string $logo = '',
        string $logoPath = '',
        string $productPath = ''
    ) {
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->port = $port;
        $this->apiWhatsapp = $apiWhatsapp;
        $this->logo = $logo;
        $this->logoPath = $logoPath;
        $this->productPath = $productPath;
    }

    public function getName(): ?string { return $this->name; }
    public function getEmail(): ?string { return $this->email; }
    public function getPassword(): ?string { return $this->password; }
    public function getPort(): ?int { return $this->port; }
    public function getApiWhatsapp(): ?string { return $this->apiWhatsapp; }
    public function getLogo(): string { return $this->logo; }
    public function getLogoPath(): string { return $this->logoPath; }
    public function getProductPath(): string { return $this->productPath; }
    public function getHost(): string { return $this->host; }

    public function setName(?string $name): void { $this->name = $name; }
    public function setEmail(?string $email): void { $this->email = $email; }
    public function setPassword(?string $password): void { $this->password = $password; }
    public function setPort(?int $port): void { $this->port = $port; }
    public function setApiWhatsapp(?string $apiWhatsapp): void { $this->apiWhatsapp = $apiWhatsapp; }
    public function setLogo(string $logo): void { $this->logo = $logo; }
    public function setLogoPath(string $logoPath): void { $this->logoPath = $logoPath; }
    public function setProductPath(string $productPath): void { $this->productPath = $productPath; }
    public function setHost(string $host): void { $this->host = $host; }

    public function toArray(): array
    {
        return [
            'name'         => $this->name,
            'email'        => $this->email,
            'password'     => $this->password,
            'port'         => $this->port,
            'api_whatsapp' => $this->apiWhatsapp,
            'logo'         => $this->logo,
            'logo_path'    => $this->logoPath,
            'product_path' => $this->productPath,
            'host'         => $this->host,
        ];
    }
}
