<?php

namespace App\Domain;

/**
 * Entidad de dominio Store.
 */
class Store
{
    private string $id;
    private string $storeName;
    private ?string $dialingCode;
    private ?string $cellphone;
    private ?string $image;
    private ?string $colors;

    public function __construct(
        string $storeName,
        ?string $dialingCode = null,
        ?string $cellphone = null,
        ?string $image = null,
        ?string $colors = null,
        string $id = ''
    ) {
        $this->id = $id;
        $this->storeName = $storeName;
        $this->dialingCode = $dialingCode;
        $this->cellphone = $cellphone;
        $this->image = $image;
        $this->colors = $colors;
    }

    public function getId(): string { return $this->id; }
    public function getStoreName(): string { return $this->storeName; }
    public function getDialingCode(): ?string { return $this->dialingCode; }
    public function getCellphone(): ?string { return $this->cellphone; }
    public function getImage(): ?string { return $this->image; }
    public function getColors(): ?string { return $this->colors; }

    public function toArray(): array
    {
        return [
            'id'           => $this->id,
            'store'        => $this->storeName,
            'dialing_code' => $this->dialingCode,
            'cellphone'    => $this->cellphone,
            'image'        => $this->image,
            'colors'       => $this->colors,
        ];
    }
}
