-- ====================================================================
-- ShoppyCatalog SaaS - Database Schema & Seed Data
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `catalogo_tienda` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `catalogo_tienda`;

-- 1. Tabla de Planes de Suscripción (SaaS)
CREATE TABLE IF NOT EXISTS `plans` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `plan` VARCHAR(100) NOT NULL,
    `advertisement` ENUM('SI', 'NO') DEFAULT 'SI',
    `max_product` INT DEFAULT 10,
    `add_user` ENUM('SI', 'NO') DEFAULT 'NO',
    `max_adduser` INT DEFAULT 1,
    `price` DECIMAL(10, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Tiendas (Tenants)
CREATE TABLE IF NOT EXISTS `stores` (
    `id` VARCHAR(36) PRIMARY KEY,
    `store` VARCHAR(255) NOT NULL,
    `dialing_code` VARCHAR(10) DEFAULT '+52',
    `cellphone` VARCHAR(30) DEFAULT NULL,
    `image` TEXT DEFAULT NULL,
    `colors` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Usuarios (Dueños de Tienda / Comerciantes)
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `lastname` VARCHAR(100) NOT NULL,
    `birthday` DATE DEFAULT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `id_store` VARCHAR(36) DEFAULT NULL,
    `id_plan` INT DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `update_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_store`) REFERENCES `stores`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`id_plan`) REFERENCES `plans`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Productos
CREATE TABLE IF NOT EXISTS `products` (
    `id` VARCHAR(36) PRIMARY KEY,
    `id_store` VARCHAR(36) NOT NULL,
    `id_user` VARCHAR(36) DEFAULT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `image` TEXT DEFAULT NULL,
    `view` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_store`) REFERENCES `stores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Órdenes / Pedidos
CREATE TABLE IF NOT EXISTS `orders` (
    `id` VARCHAR(36) PRIMARY KEY,
    `id_store` VARCHAR(36) NOT NULL,
    `id_product` VARCHAR(36) NOT NULL,
    `create_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_store`) REFERENCES `stores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla de Contraseñas Temporales
CREATE TABLE IF NOT EXISTS `tmp_pass` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_user` VARCHAR(36) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `expire_at` DATETIME NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla de Configuración Global
CREATE TABLE IF NOT EXISTS `config` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `value` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- Semillas de Datos (Seed Data)
-- ====================================================================

-- Insertar o actualizar Planes SaaS
INSERT INTO `plans` (`id`, `plan`, `advertisement`, `max_product`, `add_user`, `max_adduser`, `price`)
VALUES
    (1, 'Gratuito', 'SI', 10, 'NO', 1, 0.00),
    (2, 'Pro Emprendedor', 'NO', 50, 'SI', 3, 9.99),
    (3, 'Empresarial Ilimitado', 'NO', 99999, 'SI', 10, 24.99)
ON DUPLICATE KEY UPDATE
    `plan` = VALUES(`plan`),
    `advertisement` = VALUES(`advertisement`),
    `max_product` = VALUES(`max_product`),
    `add_user` = VALUES(`add_user`),
    `max_adduser` = VALUES(`max_adduser`),
    `price` = VALUES(`price`);
