<?php

namespace App\Domain;

/**
 * Entidad de dominio Product.
 * Representa un producto dentro del catálogo de una tienda.
 */
class Product
{
    private string $id;
    private int $storeId;
    private string $name;
    private string $description;
    private float $price;
    private string $imageUrl;

    public function __construct(
        int $storeId,
        string $name,
        string $description,
        float $price,
        string $imageUrl,
        string $id = ""
    ) {
        $this->storeId = $storeId;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->imageUrl = $imageUrl;
        $this->id = $id;
    }

    // ─── Getters ────────────────────────────────────────────

    public function getId(): string
    {
        return $this->id;
    }

    public function getStoreId(): int
    {
        return $this->storeId;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function getImageUrl(): string
    {
        return $this->imageUrl;
    }

    // ─── Setters ────────────────────────────────────────────

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
    }

    public function setImageUrl(string $imageUrl): void
    {
        $this->imageUrl = $imageUrl;
    }

    // Convierte la entidad a un arreglo asociativo.
    public function toArray(): array
    {
        return [
            'id'          => $this->id,
            'store_id'    => $this->storeId,
            'name'        => $this->name,
            'description' => $this->description,
            'price'       => $this->price,
            'image_url'   => $this->imageUrl,
        ];
    }
}
