# Mechanical Marketplace - Mobile App

Mobile application for the Mechanical Products Marketplace, built with React Native (Expo) and TypeScript.

## 🚀 Features

- ✅ User Authentication (Login/Register)
- ✅ Product browsing with search and filters
- ✅ Product detail view with image gallery
- ✅ Category filtering
- ✅ User profile management
- 🚧 Shopping cart (Coming soon)
- 🚧 Checkout & Orders (Coming soon)
- 🚧 Product reviews (Coming soon)
- 🚧 Admin panel (Coming soon)

## 📋 Prerequisites

- Node.js >= 16.x
- npm or yarn
- Expo Go app installed on your phone (for testing)
- Backend API running (see backend/README.md)

## 🔧 Installation

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Configure API URL

Edit `src/constants/api.ts`:

```typescript
// For development on emulator/simulator
export const API_URL = "http://localhost:3000/api";

// For testing on physical device
// Replace with your computer's local IP address
export const API_URL = "http://192.168.1.100:3000/api";
```

**Important:** To find your IP address:

- Windows: Run `ipconfig` in CMD
- Mac/Linux: Run `ifconfig` in Terminal
- Look for your local network IP (usually starts with 192.168.x.x)

### 3. Start the development server

```bash
npm start
```

This will open Expo DevTools in your browser.

### 4. Run on device/emulator

**On Physical Device:**

1. Install "Expo Go" app from App Store (iOS) or Google Play (Android)
2. Scan the QR code from the terminal or Expo DevTools
3. The app will load on your device

**On iOS Simulator:**

```bash
npm run ios
```

**On Android Emulator:**

```bash
npm run android
```

## 📁 Project Structure

```
mobile/
├── src/
│   ├── constants/         # App constants (API URLs, theme)
│   │   ├── api.ts
│   │   └── theme.ts
│   ├── contexts/          # React Context (Auth)
│   │   └── AuthContext.tsx
│   ├── navigation/        # Navigation setup
│   │   └── index.tsx
│   ├── screens/           # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/          # API services
│   │   └── api.ts
│   └── types/             # TypeScript types
│       └── index.ts
├── App.tsx                # App entry point
├── package.json
└── tsconfig.json
```

## 🎨 Screens

### Authentication

- **Login Screen** - User login with demo accounts
- **Register Screen** - New user registration

### Main App

- **Home Screen** - Product listing with search and category filters
- **Product Detail Screen** - Detailed product information with image gallery
- **Profile Screen** - User profile and settings

## 👥 Demo Accounts

The app includes quick-fill buttons for demo accounts:

**Customer Account:**

- Email: `customer@example.com`
- Password: `Password123!`

**Admin Account:**

- Email: `admin@example.com`
- Password: `AdminPass123!`

## 🔐 Authentication Flow

1. User enters credentials on Login/Register screen
2. App sends request to backend API
3. On success, stores JWT tokens in AsyncStorage
4. Auto-refreshes access token when expired
5. Navigates to main app screens

## 📱 Screenshots

(Add screenshots here after running the app)

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **React Query** - Server state management
- **Axios** - HTTP client
- **AsyncStorage** - Local data persistence

## 🧪 Testing

### Test on Real Device

1. Make sure your phone and computer are on the same WiFi network
2. Update API_URL in `src/constants/api.ts` with your computer's IP
3. Start backend server: `cd backend && npm run dev`
4. Start mobile app: `cd mobile && npm start`
5. Scan QR code with Expo Go app

### Common Issues

**Cannot connect to backend:**

- Check if backend is running on http://localhost:3000
- Verify API_URL is set correctly
- For physical devices, use computer's local IP instead of localhost
- Check firewall settings

**Module not found errors:**

- Run `npm install` again
- Clear cache: `npx expo start --clear`

**Port already in use:**

- Kill process on port 19000: `npx kill-port 19000`
- Or use different port: `npx expo start --port 19001`

## 📝 Development Notes

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add route in `src/navigation/index.tsx`
3. Add navigation types if needed

### API Integration

All API calls go through `src/services/api.ts`:

- Automatic token injection
- Token refresh on 401
- Error handling

### State Management

- **Auth State**: Managed by AuthContext
- **Server State**: Use React Query for caching
- **Local State**: useState for component state

## 🚧 Upcoming Features

- [ ] Shopping cart functionality
- [ ] Checkout flow
- [ ] Order history
- [ ] Product reviews and ratings
- [ ] Address management
- [ ] Push notifications
- [ ] Image upload for user avatars
- [ ] Admin product management
- [ ] Dark mode support

## 📞 Support

For issues and questions:

1. Check backend is running properly
2. Verify network connection
3. Check console logs for errors
4. Review API responses in Network tab

## 🔄 Build for Production

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Classic Build

```bash
# Build APK (Android)
expo build:android

# Build IPA (iOS - requires Mac)
expo build:ios
```

---

Made with ❤️ for IUH ReactNative Project
