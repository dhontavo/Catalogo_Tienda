<?php

namespace App\Domain;

class Plan
{
    private ?int $id;
    private ?string $plan;
    private ?string $advertisement;
    private ?int $maxProduct;
    private ?string $addUser;
    private ?int $maxAdduser;
    private ?float $price;

    public function __construct(
        ?string $plan,
        ?string $advertisement,
        ?int $maxProduct,
        ?string $addUser,
        ?int $maxAdduser,
        ?float $price,
        ?int $id = null
    ) {
        $this->plan = $plan;
        $this->advertisement = $advertisement;
        $this->maxProduct = $maxProduct;
        $this->addUser = $addUser;
        $this->maxAdduser = $maxAdduser;
        $this->price = $price;
        $this->id = $id;
    }

    public function getId(): ?int { return $this->id; }
    public function getPlan(): ?string { return $this->plan; }
    public function getAdvertisement(): ?string { return $this->advertisement; }
    public function getMaxProduct(): ?int { return $this->maxProduct; }
    public function getAddUser(): ?string { return $this->addUser; }
    public function getMaxAdduser(): ?int { return $this->maxAdduser; }
    public function getPrice(): ?float { return $this->price; }

    public function toArray(): array
    {
        return [
            'id'            => $this->id,
            'plan'          => $this->plan,
            'advertisement' => $this->advertisement,
            'max_product'   => $this->maxProduct,
            'add_user'      => $this->addUser,
            'max_adduser'   => $this->maxAdduser,
            'price'         => $this->price,
        ];
    }
}
