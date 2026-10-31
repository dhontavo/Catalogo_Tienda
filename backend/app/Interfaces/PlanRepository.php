<?php

namespace App\Interfaces;

use App\Domain\Plan;

interface PlanRepository
{
    /**
     * @return Plan[]
     */
    public function findAll(): array;

    /**
     * @param int $id
     * @return Plan|null
     */
    public function findById(int $id): ?Plan;
}
