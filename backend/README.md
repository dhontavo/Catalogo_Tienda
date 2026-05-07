# Backend — Catálogo Tienda API

API REST en PHP puro con arquitectura limpia.

## Estructura

```
backend/
│
├── app/
│   ├── Domain/              # Entidades de dominio
│   │   └── Product.php
│   │
│   ├── UseCases/            # Casos de uso (lógica de aplicación)
│   │   ├── GetProducts.php
│   │   └── CreateProduct.php
│   │
│   ├── Interfaces/          # Contratos / Interfaces
│   │   └── ProductRepository.php
│   │
│   ├── Infrastructure/      # Implementaciones concretas
│   │   ├── Database.php
│   │   ├── MySQLProductRepository.php
│   │   └── SecurityHelper.php
│   │
│   └── Controllers/         # Controladores HTTP
│       └── ProductController.php
│
├── public/                  # Punto de entrada
│   └── index.php
│
├── config/                  # Configuraciones
│   └── database.php
│
├── .htaccess
└── README.md
```

## Requisitos

- PHP 8.0+
- MySQL 5.7+ / MariaDB
- Apache con mod_rewrite habilitado (XAMPP)

## Configuración

1. Edita `config/database.php` con tus credenciales.
2. Crea la base de datos y la tabla:

## Endpoints

| Método | Ruta         | Descripción              |
|--------|-------------|--------------------------|
| GET    | `/products` | Lista productos (`?id_store=X`) |
| POST   | `/products` | Crea un producto         |

### Ejemplo: Crear producto

```bash
curl -X POST http://localhost/Catalogo_Tienda/backend/public/products \
  -H "Content-Type: application/json" \
  -d '{
    "id_store": 1,
    "name": "Camiseta Negra",
    "description": "Camiseta 100% algodón",
    "price": 299.99,
    "image": "https://example.com/camiseta.jpg"
  }'
```

## Arquitectura

Sigue los principios de **Clean Architecture**:

- **Domain**: Entidades puras, sin dependencias externas.
- **UseCases**: Lógica de negocio, depende solo de interfaces.
- **Interfaces**: Contratos que la infraestructura debe implementar.
- **Infrastructure**: Implementaciones concretas (MySQL, seguridad).
- **Controllers**: Adaptadores HTTP que conectan peticiones con casos de uso.
