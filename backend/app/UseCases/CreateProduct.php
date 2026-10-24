<?php

namespace App\UseCases;

use App\Domain\Product;
use App\Interfaces\ProductRepository;
use App\Interfaces\UserRepository;
use App\Interfaces\PlanRepository;
use App\Infrastructure\MySQLUserRepository;
use App\Infrastructure\MySQLPlanRepository;

/**
 * Caso de uso: Crear un nuevo producto con validación de límites de plan SaaS.
 */
class CreateProduct
{
    private ProductRepository $repository;
    private UserRepository $userRepository;
    private PlanRepository $planRepository;

    public function __construct(
        ProductRepository $repository,
        ?UserRepository $userRepository = null,
        ?PlanRepository $planRepository = null
    ) {
        $this->repository = $repository;
        $this->userRepository = $userRepository ?? new MySQLUserRepository();
        $this->planRepository = $planRepository ?? new MySQLPlanRepository();
    }

    /**
     * Ejecuta el caso de uso.
     *
     * @param string $storeId     ID de la tienda (UUID)
     * @param string $idUser      ID del usuario comerciante
     * @param string $name        Nombre del producto
     * @param string $description Descripción del producto
     * @param float  $price       Precio del producto
     * @param string $imageUrl    URL o Base64 de la imagen
     * @return array Producto creado serializado
     */
    public function execute(
        string $storeId,
        string $idUser,
        string $name,
        string $description,
        float $price,
        string $imageUrl
    ): array {
        // Validaciones de dominio
        if (empty(trim($name))) {
            throw new \InvalidArgumentException('El nombre del producto es obligatorio.');
        }

        if ($price < 0) {
            throw new \InvalidArgumentException('El precio no puede ser negativo.');
        }

        // Validación de límite de plan SaaS
        if (!empty($idUser)) {
            $user = $this->userRepository->findById($idUser);
            if ($user && $user->getIdPlan() > 0) {
                $plan = $this->planRepository->findById($user->getIdPlan());
                if ($plan && $plan->getMaxProduct() !== null && $plan->getMaxProduct() > 0) {
                    $currentCount = $this->repository->countByStoreId($storeId);
                    if ($currentCount >= $plan->getMaxProduct()) {
                        throw new \InvalidArgumentException(
                            "Has alcanzado el límite de {$plan->getMaxProduct()} productos permitido por tu plan ({$plan->getPlan()}). Mejora tu suscripción para continuar agregando productos."
                        );
                    }
                }
            }
        }

        $product = new Product($storeId, $idUser, $name, $description, $price, $imageUrl);
        $id = $this->repository->save($product);

        // Recuperar el producto con su ID asignado
        $saved = $this->repository->findById($id);

        return $saved ? $saved->toArray() : $product->toArray();
    }
}
