<?php

namespace App\Interfaces;

use App\Domain\Config;

/**
 * Interfaz para el repositorio de configuración.
 */
interface ConfigRepository
{
    /**
     * Obtiene la configuración actual del sistema.
     * Si no existe ninguna fila, puede retornar un objeto Config vacío o valores por defecto.
     *
     * @return Config
     */
    public function get(): Config;

    /**
     * Guarda o actualiza la configuración en la base de datos.
     *
     * @param Config $config
     * @return bool
     */
    public function update(Config $config): bool;
}
