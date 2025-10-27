# Mechanical Marketplace - Backend API

Backend API cho ứng dụng marketplace bán sản phẩm cơ khí, xây dựng với Node.js, Express, TypeScript và PostgreSQL.

## 🚀 Tính năng

- ✅ Authentication (JWT với Access & Refresh tokens)
- ✅ User management (Customer & Admin roles)
- ✅ Product catalog với search, filter, pagination
- ✅ Categories và Brands
- ✅ Shopping cart
- ✅ Order management
- ✅ Product reviews & ratings
- ✅ Inventory tracking
- ✅ Multiple product images
- ✅ Address management
- ✅ Payment integration (Stripe - ready)

## 📋 Yêu cầu hệ thống

- Node.js >= 16.x
- PostgreSQL >= 13.x
- npm hoặc yarn

## 🔧 Cài đặt

### 1. Clone repository và cài dependencies

```bash
cd backend
npm install
```

### 2. Tạo database PostgreSQL

```bash
# Đăng nhập PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE mechanical_marketplace;

# Thoát
\q
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=mechanical_marketplace
DB_USER=postgres
DB_PASSWORD=your_password

JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

CORS_ORIGIN=http://localhost:19000,http://localhost:19001
```

### 4. Chạy migrations

```bash
npm run migrate
```

### 5. Seed dữ liệu demo

```bash
npm run seed
```

### 6. Chạy server

```bash
# Development mode (với nodemon)
npm run dev

# Production build
npm run build
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 📁 Cấu trúc dự án

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   └── index.ts
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── products.controller.ts
│   │   └── misc.controller.ts
│   ├── database/         # Database setup
│   │   ├── index.ts
│   │   ├── migrate.ts
│   │   └── seed.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   └── error.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── products.routes.ts
│   │   └── misc.routes.ts
│   ├── utils/           # Utility functions
│   │   └── auth.ts
│   └── server.ts        # App entry point
├── uploads/             # Uploaded files
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "full_name": "Nguyễn Văn A",
  "phone": "0901234567"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

# Response:
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer <accessToken>
```

### Products

#### Get Products (with filters)
```bash
GET /api/products?query=máy&category=may-khoan&brand=makita&minPrice=500000&maxPrice=2000000&page=1&limit=20
```

#### Get Product by ID
```bash
GET /api/products/:id
```

#### Create Product (Admin only)
```bash
POST /api/products
Authorization: Bearer <adminAccessToken>
Content-Type: application/json

{
  "sku": "DRL-007",
  "name": "Máy khoan test",
  "description": "Mô tả sản phẩm...",
  "price": 1500000,
  "sale_price": 1300000,
  "brand_id": "uuid",
  "category_id": "uuid",
  "weight_grams": 2000,
  "stock": 10,
  "images": [
    { "url": "https://example.com/image1.jpg" },
    { "url": "https://example.com/image2.jpg" }
  ]
}
```

#### Update Product (Admin only)
```bash
PUT /api/products/:id
Authorization: Bearer <adminAccessToken>
Content-Type: application/json

{
  "price": 1400000,
  "stock": 15
}
```

#### Delete Product (Admin only)
```bash
DELETE /api/products/:id
Authorization: Bearer <adminAccessToken>
```

### Categories & Brands

#### Get Categories
```bash
GET /api/categories
```

#### Get Brands
```bash
GET /api/brands
```

## 👥 Demo Accounts

Sau khi chạy seed, bạn có thể đăng nhập với:

**Customer Account:**
- Email: `customer@example.com`
- Password: `Password123!`

**Admin Account:**
- Email: `admin@example.com`
- Password: `AdminPass123!`

## 🧪 Test API với cURL

### Test Health Check
```bash
curl http://localhost:3000/health
```

### Test Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "Password123!"
  }'
```

### Test Get Products
```bash
curl http://localhost:3000/api/products
```

### Test Get Product with Auth
```bash
# Lấy token từ login response trước
TOKEN="your_access_token_here"

curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 🗄️ Database Schema

### Users
- id (uuid, PK)
- email (unique)
- password_hash
- full_name
- phone
- role (customer/admin)
- created_at, updated_at

### Products
- id (uuid, PK)
- sku (unique)
- name
- description
- price
- sale_price
- brand_id (FK)
- category_id (FK)
- weight_grams
- is_active
- created_at, updated_at

### Categories, Brands, Product Images, Inventory, Orders, Cart, Reviews...
(Xem chi tiết trong file `src/database/migrate.ts`)

## 🔐 Security

- Passwords được hash với bcrypt
- JWT cho authentication
- Rate limiting cho API endpoints
- CORS configuration
- Helmet.js cho security headers
- Input validation

## 🛠️ Development

### Chạy migrations
```bash
npm run migrate
```

### Seed lại database
```bash
npm run seed
```

### Build production
```bash
npm run build
```

## 📝 Notes

- Server tự động restart khi code thay đổi (nodemon)
- TypeScript được compile tự động
- Logs hiển thị mọi query để debug
- Full-text search được enable cho products

## 🚧 TODO / Roadmap

- [ ] Cart API endpoints
- [ ] Orders API endpoints
- [ ] Reviews API endpoints
- [ ] Stripe payment webhook
- [ ] File upload cho product images
- [ ] Pagination improvements
- [ ] Advanced search filters
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation với Swagger

## 📞 Support

Nếu có vấn đề, hãy tạo issue hoặc liên hệ team.

---

Made with ❤️ for IUH ReactNative Project
