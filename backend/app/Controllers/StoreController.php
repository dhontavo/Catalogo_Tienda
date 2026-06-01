<?php

namespace App\Controllers;

use App\Infrastructure\MySQLStoreRepository;
use App\Infrastructure\SecurityHelper;

/**
 * Controlador REST para tiendas.
 * Recupera el nombre, logo y colores personalizados de la tienda.
 */
class StoreController
{
    private MySQLStoreRepository $repository;

    public function __construct()
    {
        $this->repository = new MySQLStoreRepository();
    }

    /**
     * GET /store?id={id_store} o GET /store?id_store={id_store}
     * Devuelve la información de la tienda.
     */
    public function show(): void
    {
        $id = $_GET['id'] ?? $_GET['id_store'] ?? null;

        if (!$id) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error' => 'Falta el parámetro id o id_store de la tienda.'
            ], 400);
            return;
        }

        try {
            $store = $this->repository->findById($id);
            
            // Si no se encuentra por ID, intentamos buscar por nombre (por si acaso el ID configurado es un alias legible)
            if (!$store) {
                $store = $this->repository->findByName($id);
            }

            if (!$store) {
                SecurityHelper::jsonResponse([
                    'success' => false,
                    'error' => "Tienda con ID '{$id}' no encontrada en la base de datos."
                ], 404);
                return;
            }

            SecurityHelper::jsonResponse([
                'success' => true,
                'data' => $store->toArray()
            ]);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error' => 'Error al obtener la tienda: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /stores
     * Devuelve la lista de todas las tiendas.
     */
    public function index(): void
    {
        try {
            $stores = $this->repository->findAll();
            $data = array_map(fn($s) => $s->toArray(), $stores);
            SecurityHelper::jsonResponse([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error' => 'Error al obtener las tiendas: ' . $e->getMessage()
            ], 500);
        }
    }
}
