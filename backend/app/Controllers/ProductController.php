<?php

namespace App\Controllers;

use App\UseCases\GetProducts;
use App\UseCases\CreateProduct;
use App\Infrastructure\MySQLProductRepository;
use App\Infrastructure\SecurityHelper;

/**
 * Controlador REST para productos.
 * Maneja las peticiones HTTP y delega la lógica a los casos de uso.
 */
class ProductController
{
    private GetProducts $getProducts;
    private CreateProduct $createProduct;

    public function __construct()
    {
        $repository = new MySQLProductRepository();
        $this->getProducts = new GetProducts($repository);
        $this->createProduct = new CreateProduct($repository);
    }

    /**
     * GET /products?store_id={id}
     * Lista los productos de una tienda.
     */
    public function index(): void
    {
        $storeId = isset($_GET['store_id']) ? (int) $_GET['store_id'] : 0;

        if ($storeId <= 0) {
            SecurityHelper::jsonResponse(
                ['error' => 'El parámetro store_id es obligatorio y debe ser mayor a 0.'],
                400
            );
        }

        try {
            $products = $this->getProducts->execute((int)$storeId);
            SecurityHelper::jsonResponse(['data' => $products]);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al obtener los productos.'],
                500
            );
        }
    }

    /**
     * POST /products
     * Crea un nuevo producto.
     */
    public function store(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            SecurityHelper::jsonResponse(
                ['error' => 'El cuerpo de la petición debe ser JSON válido.'],
                400
            );
        }

        // Validar campos requeridos
        $required = ['store_id', 'name', 'description', 'price', 'image_url'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || (is_string($input[$field]) && empty(trim($input[$field])))) {
                SecurityHelper::jsonResponse(
                    ['error' => "El campo '$field' es obligatorio."],
                    400
                );
            }
        }

        try {
            $product = $this->createProduct->execute(
                (int)    $input['store_id'],
                SecurityHelper::sanitize($input['name']),
                SecurityHelper::sanitize($input['description']),
                (float)  $input['price'],
                SecurityHelper::sanitize($input['image_url'])
            );

            SecurityHelper::jsonResponse(['data' => $product], 201);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al crear el producto.'],
                500
            );
        }
    }
}
