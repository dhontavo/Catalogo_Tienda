<?php

namespace App\Controllers;

use App\UseCases\Order;
use App\Infrastructure\MySQLOrderRepository;
use App\Infrastructure\MySQLProductRepository;
use App\Infrastructure\SecurityHelper;

/**
 * Controlador REST para órdenes y pedidos.
 * Maneja las peticiones HTTP de órdenes individuales o en lote.
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
     * POST /orders
     * Crea una o varias órdenes (soporta id_product o arreglo de products).
     */
    public function order(): void
    {
        $input = SecurityHelper::getJsonInput();

        if (empty($input['id_store'])) {
            SecurityHelper::jsonResponse(['error' => "El campo 'id_store' es obligatorio."], 400);
            return;
        }

        // Si se envió un arreglo de productos (ej. desde el carrito de compras)
        if (!empty($input['products']) && is_array($input['products'])) {
            try {
                $created = [];
                foreach ($input['products'] as $prod) {
                    $pid = $prod['id_product'] ?? $prod['id'] ?? null;
                    if ($pid) {
                        $qty = max(1, (int)($prod['quantity'] ?? 1));
                        for ($i = 0; $i < $qty; $i++) {
                            $created[] = $this->order->execute($input['id_store'], (string)$pid);
                        }
                    }
                }

                SecurityHelper::jsonResponse([
                    'success' => true,
                    'message' => 'Órdenes creadas exitosamente.',
                    'data'    => $created,
                ]);
                return;
            } catch (\Throwable $e) {
                SecurityHelper::jsonResponse(
                    ['error' => 'Error al crear las órdenes: ' . $e->getMessage()],
                    500
                );
                return;
            }
        }

        // Si se envió un único id_product
        if (empty($input['id_product'])) {
            SecurityHelper::jsonResponse(['error' => "El campo 'id_product' o 'products' es obligatorio."], 400);
            return;
        }

        try {
            $order = $this->order->execute(
                $input['id_store'],
                $input['id_product']
            );

            SecurityHelper::jsonResponse([
                'success' => true,
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

    /**
     * GET /orders?id_store={id}
     * Lista las órdenes de una tienda para el dashboard de comerciante.
     */
    public function index(): void
    {
        $storeId = $_GET['id_store'] ?? null;

        if (!$storeId) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error'   => 'Falta el parámetro id_store de la tienda.'
            ], 400);
            return;
        }

        try {
            $orders = $this->orderRepository->get($storeId);
            SecurityHelper::jsonResponse([
                'success' => true,
                'data'    => array_map(fn($o) => $o->toArray(), $orders)
            ]);
        } catch (\Throwable $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error'   => 'Error al obtener las órdenes: ' . $e->getMessage()
            ], 500);
        }
    }
}
