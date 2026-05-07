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
     * GET /products?id_store={id}
     * Lista los productos de una tienda.
     */
    public function index(): void
    {
        $storeId = $_GET['id_store'] ?? null;

        if (!$storeId) {
            SecurityHelper::jsonResponse(
                ['error' => 'El parámetro id_store es obligatorio.'],
                400
            );
            return;
        }


        try {
            $products = $this->getProducts->execute($storeId);
            SecurityHelper::jsonResponse(['data' => $products,
        'success' =>true]);
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
        $input = SecurityHelper::getJsonInput();

        // Validar campos requeridos
        $required = ['id_store', 'name', 'description', 'price', 'image'];
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
                (int)    $input['id_store'],
                SecurityHelper::sanitize($input['name']),
                SecurityHelper::sanitize($input['description']),
                (float)  $input['price'],
                SecurityHelper::sanitize($input['image'])
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
