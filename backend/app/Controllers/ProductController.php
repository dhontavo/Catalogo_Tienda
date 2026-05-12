<?php

namespace App\Controllers;

use App\UseCases\GetProducts;
use App\UseCases\CreateProduct;
use App\UseCases\DeleteProduct;
use App\UseCases\UpdateProduct;
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
    private DeleteProduct $deleteProduct;
    private UpdateProduct $updateProduct;

    public function __construct()
    {
        $repository = new MySQLProductRepository();
        $this->getProducts = new GetProducts($repository);
        $this->createProduct = new CreateProduct($repository);
        $this->deleteProduct = new DeleteProduct($repository);
        $this->updateProduct = new UpdateProduct($repository);
    }

    /**
     * GET /products?id_store={id}
     * Lista los productos de una tienda.
     */
    public function index(): void
    {
        $id = $_GET['id'] ?? null;
        $storeId = $_GET['id_store'] ?? null;

        // Si viene un ID, buscamos solo ese producto
        if ($id) {
            try {
                $product = $this->getProducts->findById($id);
                if (!$product) {
                    SecurityHelper::jsonResponse(['error' => 'Producto no encontrado', 'success' => false], 404);
                    return;
                }
                SecurityHelper::jsonResponse(['data' => $product, 'success' => true]);
                return;
            } catch (\Exception $e) {
                SecurityHelper::jsonResponse(['error' => $e->getMessage(), 'success' => false], 500);
                return;
            }
        }

        // Si no viene ID, debe venir id_store para listar
        if (!$storeId) {
            SecurityHelper::jsonResponse(
                ['error' => 'Falta el parámetro id_store o id.', 'success' => false],
                400
            );
            return;
        }

        try {
            $page  = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;

            $products = $this->getProducts->execute($storeId, $limit, $offset);
            SecurityHelper::jsonResponse(['data' => $products, 'success' => true]);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al obtener los productos: ' . $e->getMessage(), 'success' => false],
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
        $required = ['id_store', 'name', 'description', 'price', 'image', 'id_user'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || (is_string($input[$field]) && empty(trim($input[$field])))) {
                SecurityHelper::jsonResponse(
                    ['error' => "El campo {$field} es obligatorio."],
                    400
                );
                return;
            }
        }

        // Procesar la imagen en Base64 y guardarla como archivo físico
        $base64Image = $input['image'];
        $imageUrl = '';

        if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                SecurityHelper::jsonResponse(['error' => 'Formato de imagen no válido.'], 400);
                return;
            }

            $base64Image = base64_decode($base64Image);

            if ($base64Image === false) {
                SecurityHelper::jsonResponse(['error' => 'La imagen Base64 no es válida.'], 400);
                return;
            }

            // Generar nombre de archivo: fecha_hora_id_store.ext
            $dateFormated = date('Ymd_His');
            $safeStoreId = preg_replace('/[^a-zA-Z0-9-]/', '', $input['id_store']);
            $fileName = "{$dateFormated}_{$safeStoreId}.{$type}";

            $uploadDir = __DIR__ . '/../../public/uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $filePath = $uploadDir . $fileName;
            file_put_contents($filePath, $base64Image);

            // Determinar la URL del host para guardarla en la base de datos
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            $host = $_SERVER['HTTP_HOST'];
            // Asumiendo que la ruta base es /Catalogo_Tienda/backend/public
            $imageUrl = "{$protocol}://{$host}/Catalogo_Tienda/backend/public/uploads/{$fileName}";
        } else {
            SecurityHelper::jsonResponse(['error' => 'La imagen no tiene un formato Base64 válido.'], 400);
            return;
        }

        try {
            $product = $this->createProduct->execute(
                SecurityHelper::sanitize($input['id_store']),
                SecurityHelper::sanitize($input['id_user']),
                SecurityHelper::sanitize($input['name']),
                SecurityHelper::sanitize($input['description']),
                (float)  $input['price'],
                $imageUrl
            );

            SecurityHelper::jsonResponse(['data' => $product,'success' => true], 201);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse(['error' => $e->getMessage(), 'success' => false], 422);
        } catch (\Exception $e) {
            // Guardamos el error en el archivo de log (al inicio)
            \App\Infrastructure\Logger::log($e->getMessage() . "\nTrace:\n" . $e->getTraceAsString(), 'ERROR');
            error_log('Error al crear el producto: ' . $e->getMessage());
            SecurityHelper::jsonResponse(
                ['error' => 'Error al crear el producto: ' . $e->getMessage(), 'success' => false],
                500
            );
        }
    }

    /**
     * DELETE /products?id={id}
     * Elimina un producto.
     */
    public function delete(): void
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            SecurityHelper::jsonResponse(
                ['error' => 'Falta el parámetro id.'],
                400
            );
            return;
        }

        try {
            $product = $this->deleteProduct->execute($id);
            SecurityHelper::jsonResponse(['data' => $product, 'success' => true]);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse(['error' => $e->getMessage(), 'success' => false], 422);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al eliminar el producto: ' . $e->getMessage(), 'success' => false],
                500
            );
        }
    }

    /**
     * PUT /products?id={id}
     * Actualiza un producto.
     */
    public function update(): void
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            SecurityHelper::jsonResponse(
                ['error' => 'Falta el parámetro id.'],
                400
            );
            return;
        }

        $input = SecurityHelper::getJsonInput();

        try {
            $product = $this->updateProduct->execute(
                $id,
                SecurityHelper::sanitize($input['name']),
                SecurityHelper::sanitize($input['description']),
                (float)  $input['price']
            );

            SecurityHelper::jsonResponse(['data' => $product, 'success' => true]);
        } catch (\InvalidArgumentException $e) {
            SecurityHelper::jsonResponse(['error' => $e->getMessage(), 'success' => false], 422);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse(
                ['error' => 'Error al actualizar el producto: ' . $e->getMessage(), 'success' => false],
                500
            );
        }
    }
}

