<?php

namespace App\Controllers;

use App\Infrastructure\MySQLStoreRepository;
use App\Infrastructure\SecurityHelper;
use App\UseCases\GetStores;

/**
 * Controlador REST para tiendas.
 * Recupera el nombre, logo y colores personalizados de la tienda.
 */
class StoreController
{
    private MySQLStoreRepository $repository;
    private GetStores $getStores;

    public function __construct()
    {
        $this->repository = new MySQLStoreRepository();
        $this->getStores = new GetStores($this->repository);
    }

    /**
     * GET /store?id={id_store} o GET /store?id_store={id_store}
     * Devuelve la información de una tienda.
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
            
            // Si no se encuentra por ID, intentamos buscar por nombre
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
     * Devuelve la lista de todas las tiendas disponibles.
     */
    public function index(): void
    {
        try {
            $stores = $this->getStores->execute();
            SecurityHelper::jsonResponse([
                'success' => true,
                'data' => $stores
            ]);
        } catch (\Exception $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error' => 'Error al obtener las tiendas: ' . $e->getMessage()
            ], 500);
        }
    }
}
