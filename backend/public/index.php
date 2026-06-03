<?php

// ─── Autoload de Composer ────────────────────────────────────
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

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
use App\Infrastructure\Env;
use App\Infrastructure\SecurityHelper;
use App\Controllers\ProductController;
use App\Controllers\AuthController;
use App\Controllers\PlanController;
use App\Controllers\ConfigController;
use App\Controllers\StoreController;

// ─── Cargar variables de entorno ─────────────────────────────
Env::load(__DIR__ . '/../.env');


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
$productController = new ProductController();
$authController = new AuthController();
$planController = new PlanController();
$configController = new ConfigController();

switch (true) {
    // GET /config
    case $method === 'GET' && $path === '/config':
        $configController->show();
        break;

    // PUT /config
    case $method === 'PUT' && $path === '/config':
        $configController->update();
$storeController = new StoreController();

switch (true) {
    // GET /store
    case $method === 'GET' && $path === '/store':
        $storeController->show();
        break;

    // GET /stores
    case $method === 'GET' && $path === '/stores':
        $storeController->index();
        break;

    // GET /plans
    case $method === 'GET' && $path === '/plans':
        $planController->index();
        break;

    // GET /products?id_store=X
    case $method === 'GET' && $path === '/products':
        $productController->index();
        break;

    // POST /products
    case $method === 'POST' && $path === '/products':
        $productController->store();
        break;

    // DELETE /products
    case $method === 'DELETE' && $path === '/products':
        $productController->delete();
        break;

    // PUT /products
    case $method === 'PUT' && $path === '/products':
        $productController->update();
        break;

    // PUT /users/{id}
    case $method === 'PUT' && strpos($path, '/users/') === 0:
        $authController->updateProfile();
        break;

    // POST /register
    case $method === 'POST' && $path === '/register':
        $authController->register();
        break;

    // POST /login
    case $method === 'POST' && $path === '/login':
        $authController->login();
        break;

    // POST /forgot-password
    case $method === 'POST' && $path === '/forgot-password':
        $authController->forgotPassword();
        break;

    // POST /change-password
    case $method === 'POST' && $path === '/change-password':
        $authController->changePassword();
        break;

    // Ruta no encontrada
    default:
        SecurityHelper::jsonResponse(
            ['error' => 'Ruta no encontrada.', 'path' => $path],
            404
        );
        break;
}
