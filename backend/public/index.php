<?php

/**
 * Punto de entrada de la API (Front Controller).
 * Todas las peticiones pasan por aquí gracias al .htaccess.
 */

// ─── Autoload manual (sin Composer) ─────────────────────────
spl_autoload_register(function (string $class) {
    // Convierte namespace a ruta de archivo
    // App\Domain\Product → app/Domain/Product.php
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../app/';

    if (strncmp($prefix, $class, strlen($prefix)) !== 0) {
        return;
    }

    $relativeClass = substr($class, strlen($prefix));
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// ─── Imports ────────────────────────────────────────────────
use App\Infrastructure\SecurityHelper;
use App\Controllers\ProductController;

// ─── CORS & Headers ─────────────────────────────────────────
SecurityHelper::setCorsHeaders();

// ─── Routing simple ─────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Eliminar el prefijo base si existe (e.g., /Catalogo_Tienda/backend/public)
$basePath = '/Catalogo_Tienda/backend/public';
$path = str_replace($basePath, '', $uri);
$path = '/' . ltrim($path, '/');

// ─── Rutas ──────────────────────────────────────────────────
$controller = new ProductController();

switch (true) {
    // GET /products?store_id=X
    case $method === 'GET' && $path === '/products':
        $controller->index();
        break;

    // POST /products
    case $method === 'POST' && $path === '/products':
        $controller->store();
        break;

    // Ruta no encontrada
    default:
        SecurityHelper::jsonResponse(
            ['error' => 'Ruta no encontrada.', 'path' => $path],
            404
        );
        break;
}
