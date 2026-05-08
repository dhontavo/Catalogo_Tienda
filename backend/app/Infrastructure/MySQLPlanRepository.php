<?php

namespace App\Infrastructure;

use App\Domain\Plan;
use App\Interfaces\PlanRepository;
use PDO;

class MySQLPlanRepository implements PlanRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT id, plan, advertisement, max_product, add_user, max_adduser, price FROM plans ORDER BY id ASC');
        
        $plans = [];
        while ($row = $stmt->fetch()) {
            $plans[] = new Plan(
                $row['plan'],
                $row['advertisement'],
                isset($row['max_product']) ? (int)$row['max_product'] : null,
                $row['add_user'],
                isset($row['max_adduser']) ? (int)$row['max_adduser'] : null,
                isset($row['price']) ? (float)$row['price'] : null,
                (int)$row['id']
            );
        }

        return $plans;
    }
}
