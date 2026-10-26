# 🛍️ ShoppyCatalog SaaS — Plataforma Multi-inquilino de Catálogos Digitales

> Plataforma **SaaS (Software as a Service)** multi-tienda desarrollada con **Angular 21** en el frontend web, **Ionic Angular** para la app móvil y una **REST API en PHP 8** bajo Clean Architecture y principios SOLID.

---

## 🚀 Características del Sistema SaaS

- 🏢 **Multi-inquilino (Multi-tenant)**: Cada comercio opera en un espacio independiente con su propio catálogo, colores de marca, logo y número de WhatsApp para pedidos.
- 💎 **Planes de Suscripción Flexibles**:
  - **Plan Gratuito ($0/mes)**: Hasta 10 productos, pedidos ilimitados por WhatsApp, badge de la plataforma.
  - **Plan Pro Emprendedor ($9.99/mes)**: Hasta 50 productos, sin publicidad de la plataforma, hasta 3 usuarios administradores.
  - **Plan Empresarial ($24.99/mes)**: Productos ilimitados, sin publicidad, hasta 10 usuarios y soporte prioritario.
- 🎯 **Control de Límites por Plan**: El backend valida en tiempo real la cantidad de productos registrados frente al límite del plan contratado antes de permitir la publicación.
- 🪄 **Onboarding en 3 Pasos**: Asistente de registro para comerciantes (Datos del Propietario &rarr; Datos y Branding de la Tienda &rarr; Selección de Plan SaaS) con inicio de sesión automático.
- 📊 **Panel de Administración (Merchant Dashboard)**:
  - **Resumen**: KPIs en tiempo real (productos activos, barra de uso del plan, pedidos recibidos), enlace directo para compartir con botón de copiar y banner de upgrade.
  - **Gestión de Catálogo (CRUD)**: Creación con subida de imágenes y previsualización local, edición, eliminación y búsqueda en tiempo real.
  - **Bandeja de Pedidos**: Historial de órdenes realizadas por clientes con detalle del producto y fecha.
  - **Personalización de Marca**: Modificación de nombre, WhatsApp de contacto, logo y paleta cromática interactiva.
  - **Mi Plan**: Visualización de especificaciones y cambio de plan de suscripción instantáneo.
- 🛒 **Storefront Público por Tienda**: Los clientes acceden a su tienda favorita (`/store/:id_store`), exploran productos, gestionan el carrito y envían el pedido formateado directamente a WhatsApp.

---

## 🏗️ Arquitectura de la Plataforma

```
Catalogo_Tienda/
│
├── backend/                              # REST API en PHP 8
│   ├── app/
│   │   ├── Domain/                      # Modelos de dominio (Store, Plan, User, Product, Order)
│   │   ├── UseCases/                    # Lógica de negocio SaaS (CreateProduct con límite de plan, RegisterStore, etc.)
│   │   ├── Interfaces/                  # Contratos de repositorios (ProductRepository, PlanRepository, etc.)
│   │   ├── Infrastructure/              # Implementaciones MySQL, JWT, Cifrado, Helpers
│   │   └── Controllers/                 # Controladores HTTP (Store, Product, Plan, Auth, Order)
│   ├── db/
│   │   └── schema.sql                   # Esquema relacional SaaS y semillas de planes
│   ├── public/
│   │   └── index.php                    # Front Controller y Router
│   └── config/database.php              # Conexión MySQL
│
├── catalog-web/                          # Frontend Web SaaS (Angular 21 + SSR)
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── landing/                 # Portada SaaS, características, planes y vitrina
│   │   │   ├── store-list/              # Directorio de tiendas activas
│   │   │   ├── login/                   # Inicio de sesión de comerciantes
│   │   │   ├── register/                # Asistente de onboarding en 3 pasos
│   │   │   ├── dashboard/               # Panel administrativo del comerciante
│   │   │   └── catalog/                 # Catálogo público del cliente final
│   │   └── services/
│   │       ├── auth.service.ts          # Gestión de sesión, tokens y perfil
│   │       ├── auth.guard.ts            # Protección de rutas /admin
│   │       ├── catalog.service.ts       # Comunicación con API REST
│   │       └── cart.service.ts          # Carrito de compras
│   └── src/styles.css                   # Sistema de diseño SaaS y Storefront
│
└── mobile-app/
    └── ShoppyCatalog/                   # App móvil para Android/iOS (Ionic 7 + Angular)
```

---

## 🔌 Endpoints de la API REST

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/plans` | Lista los planes de suscripción disponibles |
| `POST` | `/register` | Registra comerciante, crea la tienda y asigna el plan |
| `POST` | `/login` | Inicia sesión y retorna JWT + datos de la tienda |
| `PUT` | `/users/{id}` | Actualiza perfil, cambia plan o branding |
| `GET` | `/stores` | Directorio de tiendas disponibles |
| `GET` | `/store?id_store=X` | Consulta la tienda por ID o nombre |
| `PUT` | `/store` | Actualiza branding, logo y teléfono de la tienda |
| `GET` | `/products?id_store=X` | Lista productos de una tienda |
| `POST` | `/products` | Crea producto (valida límite según el plan SaaS) |
| `PUT` | `/products?id=X` | Actualiza un producto existente |
| `DELETE` | `/products?id=X` | Elimina un producto |
| `GET` | `/orders?id_store=X` | Lista pedidos de la tienda para el dashboard |
| `POST` | `/orders` | Registra un pedido realizado desde el catálogo |

---

## 🛠️ Puesta en Marcha

### 1. Base de Datos MySQL
Importa el esquema relacional con los planes iniciales:
```bash
mysql -u root -p catalogo_tienda < backend/db/schema.sql
```

### 2. Backend PHP
Asegúrate de que Apache o el servidor de PHP apunte al directorio `public/`:
```bash
cd backend
php -S localhost:8000 -t public
```

### 3. Frontend Web (Angular 21)
```bash
cd catalog-web
npm install
npm start
```
Abre tu navegador en `http://localhost:4200` para acceder a la plataforma SaaS.
