<?php

namespace App\Interfaces;

use App\Domain\Plan;

interface PlanRepository
{
    /**
     * @return Plan[]
     */
    public function findAll(): array;
}
