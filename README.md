# 🛍️ ShoppyCatalog SaaS — Plataforma Multi-inquilino de Catálogos Digitales

> Plataforma **SaaS (Software as a Service)** multi-tienda desarrollada con soporte para **dos opciones de backend equivalentes (ASP.NET Core .NET 10 en C# y PHP 8)**, **Angular 21** con SSR en el frontend web y **Ionic 8 + Angular 20** para la aplicación móvil.

---

## 🚀 Características del Sistema SaaS

- 🏢 **Multi-inquilino (Multi-tenant)**: Cada comercio gestiona su propio espacio independiente con catálogo personalizado, logotipo, paleta cromática de marca autodetectada y canal directo de WhatsApp.
- 💎 **Planes de Suscripción SaaS**:
  - **Plan Gratuito ($0/mes)**: Hasta 10 productos, pedidos ilimitados por WhatsApp y badge de la plataforma.
  - **Plan Pro Emprendedor ($9.99/mes)**: Hasta 50 productos, sin publicidad y hasta 3 usuarios administradores.
  - **Plan Empresarial Ilimitado ($24.99/mes)**: Productos ilimitados, sin publicidad, hasta 10 usuarios y soporte prioritario.
- 💳 **Pasarela de Pagos Stripe Integrada**:
  - **Checkout de Planes SaaS**: Los comerciantes pueden actualizar su suscripción mediante Stripe Checkout con confirmación automática.
  - **Cobro de Carrito de Compras**: Los clientes de las tiendas pueden pagar su pedido directamente con tarjeta mediante sesiones seguras de Stripe.
  - **Webhooks y Verificación**: Manejo de eventos `checkout.session.completed`, registro en tabla `subscriptions` y actualización automática de límites.
- 🔐 **Seguridad y Recuperación de Cuentas**:
  - Validación de **X-API-Key** en todas las rutas de la API.
  - Hashes criptográficos compatibles con **BCrypt** y autenticación mediante **JWT (HS256)**.
  - Flujo de **recuperación de contraseña**: Generación de credenciales temporales seguras de 8 caracteres con caducidad (10 min) y envío de correo con plantilla HTML moderna vía SMTP.
- 🎨 **Detección Automática de Paleta de Marca**:
  - Al subir el logotipo de una tienda, el backend analiza la imagen y extrae automáticamente los colores predominantes para aplicar la temática visual del catálogo.
- 📊 **Panel de Control del Comerciante (Merchant Dashboard)**:
  - KPIs en tiempo real (productos activos, cupo restante del plan, pedidos recibidos).
  - Gestión integral de productos (CRUD con subida de imágenes y previsualización).
  - Bandeja y tracking de pedidos.
  - Personalización de identidad visual (nombre, WhatsApp, logo y colores).
- 🛒 **Storefront Público Responsivo**:
  - Vitrina interactiva (`/store/:id_store`) con carrito de compras, cálculo de totales, integración con Stripe y opción de enviar pedido formateado por WhatsApp.

---

## 🏗️ Arquitectura del Repositorio

```
Catalogo_Tienda/
│
├── backend-dotnet/                           # REST API en C# (.NET 10 / ASP.NET Core)
│   └── backend-dotnet/
│       ├── Controllers/                      # Auth, Config, Order, Plan, Product, Store, Stripe
│       ├── Data/                             # Conexión MySQL de alto rendimiento (Dapper)
│       ├── Middleware/                       # Validación de API Key y CORS
│       ├── Models/                           # Entidades de dominio y DTOs
│       ├── Repositories/                     # Acceso a datos relacionales con Dapper
│       ├── Services/                         # JWT, BCrypt, SkiaSharp (colores), Stripe, MailKit
│       ├── Templates/                        # Plantilla HTML para correos de recuperación
│       ├── wwwroot/uploads/                  # Archivos estáticos de logos y productos
│       └── appsettings.json                  # Configuración de base de datos, Stripe y SMTP
│
├── backend/                                  # REST API en PHP 8 (Clean Architecture)
│   ├── app/
│   │   ├── Domain/                           # Modelos de dominio (Store, Plan, User, Product, Order)
│   │   ├── UseCases/                         # Casos de uso de negocio
│   │   ├── Interfaces/                       # Contratos de repositorios
│   │   ├── Infrastructure/                   # Implementaciones PDO, JWT, ImageHelper, StripeService
│   │   └── Controllers/                      # Controladores REST
│   ├── db/schema.sql                         # Esquema relacional MySQL y semillas
│   ├── public/index.php                      # Front Controller y Router
│   └── .env                                  # Variables de entorno
│
├── catalog-web/                              # Frontend Web SaaS (Angular 21 + SSR)
│   ├── src/app/
│   │   ├── components/                       # Landing, Store-List, Login, Register, Dashboard, Catalog
│   │   └── services/                         # AuthService, CatalogService, CartService, StripeService
│   └── package.json
│
└── mobile-app/
    └── ShoppyCatalog/                        # Aplicación Móvil (Ionic 8 + Angular 20 + Capacitor)
        ├── src/app/                          # Páginas y componentes móviles
        └── package.json
```

---

## 🔌 Especificación de la API REST

Ambos backends (.NET y PHP) implementan de forma exacta la misma especificación de endpoints y contratos JSON:

### 🔑 Autenticación y Perfil
| Método | Ruta | Header Requerido | Descripción |
|---|---|---|---|
| `POST` | `/register` | `X-API-Key` | Registra usuario y opcionalmente su tienda con logo y plan |
| `POST` | `/login` | `X-API-Key` | Autentica credenciales y retorna token JWT y datos de tienda |
| `POST` | `/forgot-password` | `X-API-Key` | Emite clave temporal de 10 min y envía correo HTML |
| `POST` | `/change-password` | `X-API-Key` | Actualiza la contraseña y revoca claves temporales |
| `PUT` | `/users/{id}` | `X-API-Key`, `Authorization` | Actualiza datos del perfil del comerciante y su tienda |

### 🏢 Tiendas y Branding
| Método | Ruta | Header Requerido | Descripción |
|---|---|---|---|
| `GET` | `/stores` | `X-API-Key` | Directorio de tiendas registradas |
| `GET` | `/store?id_store=X` | `X-API-Key` | Obtiene tienda por ID o nombre (incluye logo y colores) |
| `PUT` | `/store` | `X-API-Key` | Actualiza nombre, teléfono, logo y colores de la tienda |

### 📦 Productos
| Método | Ruta | Header Requerido | Descripción |
|---|---|---|---|
| `GET` | `/products?id_store=X&page=1&limit=10` | `X-API-Key` | Lista productos paginados de una tienda |
| `GET` | `/products?id=X` | `X-API-Key` | Obtiene el detalle de un producto e incrementa vistas |
| `POST` | `/products` | `X-API-Key` | Crea producto (valida límite de catálogo del plan) |
| `PUT` | `/products?id=X` | `X-API-Key` | Actualiza información o imagen de un producto |
| `DELETE` | `/products?id=X` | `X-API-Key` | Elimina un producto del catálogo |

### 📋 Planes, Órdenes y Configuración
| Método | Ruta | Header Requerido | Descripción |
|---|---|---|---|
| `GET` | `/plans` | `X-API-Key` | Lista de planes SaaS y sus especificaciones |
| `POST` | `/orders` | `X-API-Key` | Registra una orden individual o múltiple desde el carrito |
| `GET` | `/orders?id_store=X` | `X-API-Key` | Lista pedidos de la tienda para el dashboard |
| `GET` | `/config` | `X-API-Key` | Obtiene la configuración general del sistema |
| `PUT` | `/config` | `X-API-Key` | Actualiza parámetros generales de la plataforma |

### 💳 Stripe & Suscripciones
| Método | Ruta | Header Requerido | Descripción |
|---|---|---|---|
| `GET` | `/stripe/config` | `X-API-Key` | Obtiene la clave publicable y moneda configurada |
| `POST` | `/stripe/create-checkout-session` | `X-API-Key` | Crea sesión Stripe Checkout (`type: "plan"` o `"order"`) |
| `GET` | `/stripe/verify-session?session_id=X`| `X-API-Key` | Verifica pago en Stripe y aplica upgrade o pedidos |
| `GET` | `/subscriptions?id_user=X` | `X-API-Key` | Historial de suscripciones y planes del comerciante |
| `POST` | `/stripe/webhook` | `Stripe-Signature` | Webhook público de Stripe (`checkout.session.completed`) |

---

## 🛠️ Puesta en Marcha

### 1. Base de Datos MySQL
Crea la base de datos e importa el esquema relacional con los planes iniciales:
```bash
mysql -u root -p catalogo_tienda < backend/db/schema.sql
```

---

### 2. Opción de Backend A: .NET 10 / C# (Recomendado)
Asegúrate de tener instalado el SDK de .NET:
```bash
cd backend-dotnet/backend-dotnet/backend-dotnet
dotnet run
```
La API quedará escuchando en `http://localhost:5000` (o el puerto configurado en `launchSettings.json`).

---

### 3. Opción de Backend B: PHP 8
Configura tu archivo `backend/.env` con la base de datos y credenciales de Stripe/SMTP:
```bash
cd backend
php -S localhost:8000 -t public
```
La API quedará escuchando en `http://localhost:8000`.

---

### 4. Frontend Web (Angular 21)
```bash
cd catalog-web
npm install
npm start
```
Abre tu navegador en `http://localhost:4200` para acceder a la plataforma SaaS.

---

### 5. App Móvil (Ionic 8 + Angular 20)
```bash
cd mobile-app/ShoppyCatalog
npm install
npm start
```
Para sincronizar y ejecutar en emulador/dispositivo Android:
```bash
npx cap sync android
npx cap open android
```

---

## 🔒 Variables de Entorno y Claves

Por seguridad, nunca confirmes archivos con claves privadas al repositorio. Utiliza las plantillas de ejemplo:
- Backend .NET: [appsettings.json](file:///c:/xampp/htdocs/Catalogo_Tienda/backend-dotnet/backend-dotnet/backend-dotnet/appsettings.json)
- Backend PHP: [backend/.env.example](file:///c:/xampp/htdocs/Catalogo_Tienda/backend/.env.example)
- Frontend Web: [environment.ts](file:///c:/xampp/htdocs/Catalogo_Tienda/catalog-web/src/environments/environment.ts)
