<?php

namespace App\UseCases;

use App\Interfaces\PlanRepository;

class GetAllPlans
{
    private PlanRepository $repository;

    public function __construct(PlanRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @return array
     */
    public function execute(): array
    {
        $plans = $this->repository->findAll();
        
        $result = [];
        foreach ($plans as $plan) {
            $result[] = $plan->toArray();
        }
        
        return $result;
    }
}
