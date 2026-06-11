<?php

namespace App\Controllers;


use App\UseCases\Order;
use App\Infrastructure\MySQLOrderRepository;
use App\Infrastructure\MySQLProductRepository;
use App\Infrastructure\SecurityHelper;

/**
 * Controlador REST para autenticación.
 * Maneja las peticiones HTTP de ordenes
 */
class OrderController
{
    private Order $order;
    private MySQLOrderRepository $orderRepository;
    private MySQLProductRepository $productRepository;

    public function __construct()
    {
        $this->orderRepository = new MySQLOrderRepository();
        $this->productRepository = new MySQLProductRepository();
        $this->order = new Order($this->orderRepository);
    }

    /**
     * POST /order
     * Crea una nueva orden.
     */
    public function order(): void
    {
        $input = SecurityHelper::getJsonInput();

        // Validar campos requeridos
        $required = ['id_store', 'id_product'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                SecurityHelper::jsonResponse(
                    ['error' => "El campo '$field' es obligatorio."],
                    400
                );
            }
        }

        try {
            $order = $this->order->execute(
                $input['id_store'],
                $input['id_product']
            );

            SecurityHelper::jsonResponse([
                'message' => 'Orden creada exitosamente.',
                'data'    => $order,
            ]);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse(['error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al crear la orden: ' . $e->getMessage()],
                500
            );
        }
    }
}