# 🛍️ ShoppyCatalog

> A product catalog mobile app built with **Ionic Angular** and a **PHP REST API** backend, following Clean Architecture and SOLID principles.

---

## 📌 Project Status

> ⚠️ **This project is currently under active development.**  
> Core product catalog functionality is implemented. Authentication and order management are planned for upcoming iterations.

---

## 🧩 Features (Current)

- 📦 Product catalog listing with dynamic data from the API
- 🔌 REST API integration between mobile client and PHP backend
- 🔐 Token-based request protection
- 🔒 OpenSSL encryption for sensitive data

## 🗺️ Roadmap

- [ ] User authentication (login / register)
- [ ] Shopping cart
- [ ] Order management
- [ ] Admin panel

---

## 🏗️ Architecture

This project follows **Clean Architecture** with a clear separation of concerns between layers:

```
ShoppyCatalog/
├── backend/              # PHP REST API
│   ├── controllers/      # Request handling
│   ├── models/           # Business logic & data
│   ├── repositories/     # Database access layer
│   └── config/           # DB connection & env config
│
└── mobile-app/
    └── ShoppyCatalog/    # Ionic Angular app
        ├── src/
        │   ├── app/
        │   │   ├── pages/        # UI screens
        │   │   ├── services/     # API communication
        │   │   └── models/       # TypeScript interfaces
        │   └── environments/     # API base URLs
```

**Design principles applied:**
- ✅ Clean Architecture (separation of concerns by layers)
- ✅ SOLID Principles
- ✅ RESTful API design

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | Ionic 7 + Angular + TypeScript |
| Styling | SCSS |
| Backend | PHP 8 |
| Database | MySQL |
| Security | OpenSSL · Token-based auth |
| API Style | REST |

---

## 🚀 Getting Started

### Prerequisites

- PHP 8.x
- MySQL 5.7+
- Node.js 18+
- Ionic CLI (`npm install -g @ionic/cli`)

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/dhontavo/Catalogo_Tienda.git
cd Catalogo_Tienda/backend

# 2. Configure your database connection
cp config/config.example.php config/config.php
# Edit config.php with your DB credentials

# 3. Import the database schema
mysql -u root -p your_database < database/schema.sql

# 4. Start a local PHP server
php -S localhost:8000
```

---

### Mobile App Setup

```bash
cd mobile-app/ShoppyCatalog

# Install dependencies
npm install

# Update the API base URL in:
# src/environments/environment.ts
# → apiUrl: 'http://localhost:8000/api'

# Run in browser
ionic serve

# Run on Android
ionic capacitor run android
```

---

## 🔐 Security

- API endpoints are protected using **token-based authentication**
- Sensitive data is encrypted using **OpenSSL**

---

## 👤 Author

**dhontavo**  
[GitHub Profile](https://github.com/dhontavo)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).