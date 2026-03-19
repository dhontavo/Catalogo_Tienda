<?php
class Product {
    private int $id;
    private int $storeId;
    private string $name;
    private string $description;
    private float $price;
    private string $imageUrl;

    // Constructor
    public function __construct(
        int $storeId,
        string $name,
        string $description,
        float $price,
        string $imageUrl,
        int $id = 0
    ) {
        $this->storeId = $storeId;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->imageUrl = $imageUrl;
        $this->id = $id;
    }

    // Getters
    public function getId(): int {
        return $this->id;
    }

    public function getStoreId(): int {
        return $this->storeId;
    }

    public function getName(): string {
        return $this->name;
    }

    public function getDescription(): string {
        return $this->description;
    }

    public function getPrice(): float {
        return $this->price;
    }

    public function getImageUrl(): string {
        return $this->imageUrl;
    }

    // Setters
    public function setName(string $name): void {
        $this->name = $name;
    }

    public function setDescription(string $description): void {
        $this->description = $description;
    }

    public function setPrice(float $price): void {
        $this->price = $price;
    }

    public function setImageUrl(string $imageUrl): void {
        $this->imageUrl = $imageUrl;
    }
}