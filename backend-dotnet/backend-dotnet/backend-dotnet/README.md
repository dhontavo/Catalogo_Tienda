# ShoppyCatalog Backend - ASP.NET Core (.NET 10)

Migración completa y equivalente del backend PHP a **C# ASP.NET Core Web API**, manteniendo 100% de compatibilidad con los clientes frontend (`catalog-web` y `mobile-app`).

---

## 🚀 Requisitos y Tecnologías

- **.NET SDK 10 / 11**
- **MySQL / MariaDB** (XAMPP o servidor independiente en puerto `3306`)
- **Dapper + MySqlConnector** (Acceso a datos de alto rendimiento)
- **BCrypt.Net-Next** (Compatibilidad directa con hashes `password_hash` de PHP)
- **System.IdentityModel.Tokens.Jwt** (Tokens JWT HS256)
- **SkiaSharp** (Procesamiento de imágenes y extracción de paleta de colores dominantes)
- **Stripe.net** (Checkout Sessions, verificación y Webhooks de suscripciones y órdenes)
- **MailKit + MimeKit** (Envío de correos SMTP con plantilla HTML)

---

## 📁 Estructura del Proyecto

```
backend-dotnet/backend-dotnet/backend-dotnet/
├── Controllers/
│   ├── AuthController.cs        # /register, /login, /forgot-password, /change-password, /users/{id}
│   ├── ConfigController.cs      # GET /config, PUT /config
│   ├── OrderController.cs       # POST /orders, GET /orders?id_store={id}
│   ├── PlanController.cs        # GET /plans
│   ├── ProductController.cs     # GET, POST, PUT, DELETE /products
│   ├── StoreController.cs       # GET /store, GET /stores, PUT /store
│   └── StripeController.cs      # /stripe/config, /stripe/create-checkout-session, /stripe/verify-session, /stripe/webhook, /subscriptions
├── Data/
│   └── DatabaseConnectionFactory.cs
├── Middleware/
│   └── ApiKeyMiddleware.cs      # Validación de header X-API-Key en todos los endpoints (excepto webhook y preflight)
├── Models/
│   ├── Config.cs
│   ├── Order.cs
│   ├── Plan.cs
│   ├── Product.cs
│   ├── Requests.cs
│   ├── Store.cs
│   ├── Subscription.cs
│   ├── TemporaryPassword.cs
│   └── User.cs
├── Repositories/
│   ├── ConfigRepository.cs
│   ├── OrderRepository.cs
│   ├── PlanRepository.cs
│   ├── ProductRepository.cs
│   ├── StoreRepository.cs
│   ├── SubscriptionRepository.cs
│   ├── TemporaryPasswordRepository.cs
│   └── UserRepository.cs
├── Services/
│   ├── EmailService.cs          # Envío de contraseña temporal con plantilla HTML
│   ├── ImageService.cs          # Decodificación base64, guardado y cálculo de colores dominantes con SkiaSharp
│   ├── JwtService.cs            # Emisión y validación de tokens JWT HS256
│   ├── PasswordHasher.cs        # BCrypt y validación de contraseñas seguras
│   └── StripeService.cs         # Sesiones de checkout y validación de firma webhook
├── Templates/
│   └── email_temp_password.html # Plantilla HTML de correo
├── wwwroot/
│   └── uploads/                 # Archivos estáticos de logos y productos
├── appsettings.json             # Cadenas de conexión y credenciales seguras
└── Program.cs                   # Configuración del pipeline, CORS, Middlewares y DI
```

---

## 🛠️ Configuración (`appsettings.json`)

Edita el archivo `appsettings.json` o define variables de entorno:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=catalogo_tienda;User=root;Password=;CharSet=utf8mb4;"
  },
  "Security": {
    "ApiKey": "tu_api_key_aqui",
    "JwtSecret": "tu_jwt_secret_aqui"
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "PublishableKey": "pk_test_...",
    "WebhookSecret": "whsec_...",
    "Currency": "mxn"
  },
  "Smtp": {
    "Host": "localhost",
    "Port": 587,
    "Username": "no-reply@shoppycatalog.com",
    "Password": "",
    "FromName": "ShoppyCatalog",
    "FromEmail": "no-reply@shoppycatalog.com"
  }
}
```

---

## ▶️ Ejecución

```bash
cd backend-dotnet/backend-dotnet/backend-dotnet
dotnet run
```

La API estará escuchando en los puertos configurados (por defecto `http://localhost:5000` / `https://localhost:5001`).

---

## 🔒 Autenticación y Seguridad

- **X-API-Key**: Todas las peticiones deben incluir el encabezado `X-API-Key: tu_api_key_aqui` (o query parameter `?api_key=...`), excepto `POST /stripe/webhook`.
- **JWT Bearer Token**: Generado al hacer `POST /login` y requerido en rutas autenticadas.
- **CORS**: Habilitado para permitir peticiones desde cualquier origen (Angular / Ionic / Flutter).
