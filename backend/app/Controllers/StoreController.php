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

    /**
     * PUT /store
     * Actualiza la información y personalización de una tienda.
     */
    public function update(): void
    {
        $input = SecurityHelper::getJsonInput();
        $id = $input['id'] ?? $input['id_store'] ?? $_GET['id'] ?? $_GET['id_store'] ?? null;

        if (!$id) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error'   => 'Falta el ID de la tienda a actualizar.'
            ], 400);
            return;
        }

        try {
            $existing = $this->repository->findById($id);
            if (!$existing) {
                SecurityHelper::jsonResponse([
                    'success' => false,
                    'error'   => 'Tienda no encontrada.'
                ], 404);
                return;
            }

            $storeName   = !empty($input['store']) ? SecurityHelper::sanitize($input['store']) : $existing->getStoreName();
            $dialingCode = isset($input['dialing_code']) ? SecurityHelper::sanitize($input['dialing_code']) : $existing->getDialingCode();
            $cellphone   = isset($input['cellphone']) ? SecurityHelper::sanitize($input['cellphone']) : $existing->getCellphone();
            $colors      = isset($input['colors']) ? $input['colors'] : $existing->getColors();
            $image       = $existing->getImage();

            if (!empty($input['image']) && strpos($input['image'], 'data:image') === 0) {
                $logoData = \App\Infrastructure\ImageHelper::processAndSaveImage($input['image'], 'logos');
                $image = $logoData['url'];
                if (empty($input['colors']) && !empty($logoData['colors'])) {
                    $colors = $logoData['colors'];
                }
            }

            $updatedStore = new \App\Domain\Store(
                $storeName,
                $dialingCode,
                $cellphone,
                $image,
                $colors,
                $id
            );

            $this->repository->update($updatedStore);

            SecurityHelper::jsonResponse([
                'success' => true,
                'message' => 'Tienda actualizada exitosamente.',
                'data'    => $updatedStore->toArray()
            ]);
        } catch (\Throwable $e) {
            SecurityHelper::jsonResponse([
                'success' => false,
                'error'   => 'Error al actualizar la tienda: ' . $e->getMessage()
            ], 500);
        }
    }
}

