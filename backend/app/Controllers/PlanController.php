<?php

namespace App\Controllers;

use App\Infrastructure\MySQLPlanRepository;
use App\UseCases\GetAllPlans;
use App\Infrastructure\SecurityHelper;

class PlanController
{
    private GetAllPlans $getAllPlans;

    public function __construct()
    {
        $repository = new MySQLPlanRepository();
        $this->getAllPlans = new GetAllPlans($repository);
    }

    public function index(): void
    {
        try {
            $plans = $this->getAllPlans->execute();
            SecurityHelper::jsonResponse([
                'success' => true,
                'data' => $plans
            ]);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error' => 'Error al obtener los planes: ' . $e->getMessage()
            ], 500);
        }
    }
}
