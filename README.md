# Mechanical Products Marketplace

Ứng dụng marketplace bán sản phẩm cơ khí được xây dựng với React Native (Expo) + Node.js/Express + PostgreSQL.

## 📱 Dự án gồm 2 phần:

- **backend/** - API server (Node.js + Express + TypeScript + PostgreSQL)
- **mobile/** - Mobile app (React Native + Expo + TypeScript)

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
# Cấu hình .env file
# Tạo PostgreSQL database
npm run migrate
npm run seed
npm run dev
```

Server chạy tại: http://localhost:3000

### Mobile Setup

```bash
cd mobile
npm install
npm start
```

Scan QR code bằng Expo Go app để chạy trên điện thoại.

## 📚 Documentation

- [Backend README](./backend/README.md) - Chi tiết về API, database, authentication
- [Mobile README](./mobile/README.md) - Chi tiết về React Native app

## ✨ Tính năng

- 🔐 Authentication (Register/Login với JWT)
- 📦 Product catalog với search & filters
- 🛒 Shopping cart
- 💳 Checkout & Orders
- ⭐ Product reviews & ratings
- 👤 User profile & addresses
- 🔧 Admin panel (product management)

## 👥 Demo Accounts

**Customer:**

- Email: customer@example.com
- Password: Password123!

**Admin:**

- Email: admin@example.com
- Password: AdminPass123!

## 🛠️ Tech Stack

### Backend

- Node.js + Express
- TypeScript
- PostgreSQL
- JWT Authentication
- Bcrypt
- Stripe (payment ready)

### Mobile

- React Native (Expo)
- TypeScript
- React Navigation
- React Query
- AsyncStorage
- Axios

## 📝 License

MIT

---

IUH - ReactNative Project - HK7
