# Quick Start Guide - Mechanical Marketplace

## ⚡ Khởi động nhanh

### 1. Backend

```bash
cd backend
npm install
npm run build
npm run seed    # Tạo dữ liệu demo
node dist/server.js  # Hoặc npm start
```

Backend chạy tại: `http://192.168.1.9:3000`

### 2. Mobile

```bash
cd mobile
npm install
npx expo start
```

Scan QR code bằng **Expo Go** app

## 👤 Tài khoản Demo

### Khách hàng

- **Email**: `customer@example.com`
- **Password**: `Password123!`

### Admin

- **Email**: `admin@example.com`
- **Password**: `AdminPass123!`

## 🔧 Khắc phục lỗi thường gặp

### Lỗi "Login Failed" / "Network Error"

**Nguyên nhân**: Mobile app không kết nối được backend

**Giải pháp**:

1. **Kiểm tra IP máy tính**:

```powershell
ipconfig | Select-String -Pattern "IPv4"
```

2. **Cập nhật IP trong mobile app**:

Mở file: `mobile/src/constants/api.ts`

```typescript
export const API_URL = "http://192.168.1.9:3000/api"; // Đổi IP này
```

3. **Đảm bảo backend đang chạy**:

```bash
cd backend
node dist/server.js
```

Bạn sẽ thấy:

```
🚀 Server running on port 3000
📱 Mobile access: http://192.168.1.9:3000/health
```

4. **Reload mobile app**:
   - Shake device → Reload
   - Hoặc press `r` trong Expo terminal

### Lỗi "Invalid credentials"

**Nguyên nhân**: Mật khẩu trong database không khớp

**Giải pháp**:

1. Chạy lại seed script:

```bash
cd backend
npx ts-node --transpile-only src/database/seed.ts
```

2. Thử đăng nhập lại với:
   - Email: `customer@example.com`
   - Password: `Password123!` (có chữ P hoa, số 123, dấu !)

### Backend không nhận request từ mobile

**Nguyên nhân**: Backend chỉ listen trên localhost

**Giải pháp**:

Backend phải listen trên `0.0.0.0` để nhận request từ devices khác:

File `backend/src/server.ts`:

```typescript
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => { ... });
```

### Firewall chặn kết nối

**Windows Firewall**:

1. Control Panel → Windows Defender Firewall
2. Advanced Settings → Inbound Rules
3. Tìm Node.js
4. Allow connection for Private networks

## 📱 Test trên thiết bị thật

### Android/iOS với Expo Go:

1. Cài **Expo Go** app từ App Store/Play Store
2. Đảm bảo điện thoại và máy tính **cùng WiFi**
3. Scan QR code trong terminal Expo
4. App sẽ tự động load

### Nếu không load được:

1. Kiểm tra WiFi (phải cùng mạng)
2. Tắt VPN trên máy tính/điện thoại
3. Kiểm tra firewall
4. Restart Expo: `npx expo start --clear`

## 🗂️ Cấu trúc Database

13 bảng chính:

- `users` - Người dùng (customer/admin)
- `products` - Sản phẩm cơ khí
- `categories` - Danh mục (Máy khoan, Máy hàn, v.v.)
- `brands` - Thương hiệu (Makita, Bosch, DeWalt, Stanley)
- `product_images` - Hình ảnh sản phẩm
- `inventory` - Tồn kho
- `carts`, `cart_items` - Giỏ hàng
- `orders`, `order_items` - Đơn hàng
- `payments` - Thanh toán
- `addresses` - Địa chỉ giao hàng
- `reviews` - Đánh giá sản phẩm

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Lấy thông tin user

### Products

- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (admin)
- `PUT /api/products/:id` - Cập nhật (admin)
- `DELETE /api/products/:id` - Xóa (admin)

### Categories & Brands

- `GET /api/categories` - Danh sách danh mục
- `GET /api/brands` - Danh sách thương hiệu

## 🎨 Tính năng hiện tại

✅ Đăng nhập/Đăng ký
✅ Xem danh sách sản phẩm
✅ Tìm kiếm sản phẩm
✅ Lọc theo danh mục
✅ Xem chi tiết sản phẩm
✅ Profile người dùng

🚧 Đang phát triển:

- Giỏ hàng
- Checkout & thanh toán
- Quản lý đơn hàng
- Admin panel

## 💡 Tips

1. **Luôn check backend logs** khi mobile có lỗi
2. **Dùng demo buttons** để test nhanh (Login as Customer)
3. **Reload app thường xuyên** khi thay đổi code
4. **Check Expo logs** trong terminal để debug

## 🆘 Cần hỗ trợ?

1. Kiểm tra backend logs
2. Kiểm tra mobile logs trong Expo terminal
3. Verify API URL đúng IP máy tính
4. Test API bằng browser: `http://192.168.1.9:3000/health`
