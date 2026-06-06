<?php

/**
 * Entidad de dominio Order.
 */

class Order {
    private string $id;
    private string $id_store;
    private string $id_product;
    private string $create_at;

    // Constructor
    public function __construct(
        string $id = '',
        string $id_store = '',
        string $id_product = '',
        string $create_at = ''
    ) {
        $this->id = $id ?: $this->generateUuid();
        $this->id_store = $id_store;
        $this->id_product = $id_product;
        $this->create_at = $create_at ?: date('Y-m-d H:i:s');
    }

    // Getters
    public function getId(): string {
        return $this->id;
    }

    public function getStoreId(): string {
        return $this->id_store;
    }

    public function getProductId(): string {
        return $this->id_product;
    }

    public function getCreateAt(): string {
        return $this->create_at;
    }

    // Setters
    public function setIdStore(string $id_store): void {
        $this->id_store = $id_store;
    }

    public function setIdProduct(string $id_product): void {
        $this->id_product = $id_product;
    }

    // Método para generar UUID (simple)
    private function generateUuid(): string {
        return bin2hex(random_bytes(16));
    }

    // Método para convertir a array (útil para insertar en DB)
    public function toArray(): array {
        return [
            'id' => $this->id,
            'id_store' => $this->id_store,
            'id_product' => $this->id_product,
            'create_at' => $this->create_at
        ];
    }
}
