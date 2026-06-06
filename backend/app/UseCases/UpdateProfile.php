<?php

namespace App\UseCases;

use App\Interfaces\UserRepository;
use App\Interfaces\StoreRepository;
use App\Domain\User;
use App\Domain\Store;
use App\Infrastructure\ImageHelper;

/**
 * Caso de uso: Actualizar el perfil del usuario y su tienda.
 */
class UpdateProfile
{
    private UserRepository $userRepository;
    private StoreRepository $storeRepository;

    public function __construct(UserRepository $userRepository, StoreRepository $storeRepository)
    {
        $this->userRepository = $userRepository;
        $this->storeRepository = $storeRepository;
    }

    public function execute(string $userId, array $data): User
    {
        // 1. Cargar usuario actual
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            throw new \InvalidArgumentException('Usuario no encontrado.');
        }

        // 2. Actualizar campos del usuario
        if (isset($data['name'])) $user->setName($data['name']);
        if (isset($data['lastname'])) $user->setLastname($data['lastname']);
        if (isset($data['birthday'])) $user->setBirthday($data['birthday']);
        if (isset($data['email'])) $user->setEmail($data['email']);
        if (isset($data['username'])) $user->setUsername($data['username']);
        if (isset($data['id_plan'])) $user->setIdPlan((int)$data['id_plan']);

        // 3. Cargar y actualizar tienda asociada
        $store = $this->storeRepository->findById($user->getStoreId());
        if ($store) {
            $storeName = $data['store'] ?? $store->getStoreName();
            $imageUrl = $store->getImage();
            $colors = $store->getColors();

            // Si viene una imagen en Base64, la procesamos y detectamos colores
            if (!empty($data['image']) && strpos($data['image'], 'data:image') === 0) {
                $logoData = ImageHelper::processAndSaveImage($data['image'], 'logos');
                $imageUrl = $logoData['url'];
                $colors = $logoData['colors'];
            } elseif (isset($data['colors'])) {
                // Si no hay imagen nueva pero hay colores manuales, los actualizamos
                $colors = $data['colors'];
            }

            $dialingCode = $data['dialing_code'] ?? $store->getDialingCode();
            $cellphone = $data['cellphone'] ?? $store->getCellphone();
            
            $updatedStore = new Store(
                $storeName,
                $dialingCode,
                $cellphone,
                $imageUrl,
                $colors,
                $store->getId()
            );

            $this->storeRepository->update($updatedStore);
        }

        // 4. Guardar cambios del usuario
        $this->userRepository->update($user);

        // 5. Devolver usuario actualizado con los datos de la tienda recargados
        return $this->userRepository->findById($userId);
    }
}
