import { Platform } from "react-native";

// API Base URL - Auto-detect based on platform
// For web: use localhost
// For mobile: use IP address (change to your computer's IP)
const getApiUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:3000/api";
  }
  // For mobile devices, use your computer's local IP
  // Change this to your actual IP address
  return "http://192.168.1.118:3000/api";
};

export const API_URL = getApiUrl();

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login", 
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  PROFILE: "/auth/profile",
  LOGOUT: "/auth/logout",

  // Products
  PRODUCTS: "/products",
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,

  // Categories & Brands
  CATEGORIES: "/categories",
  BRANDS: "/brands",

  // Cart
  CART: "/cart",
  CART_ITEMS: "/cart/items",
  CART_ITEM: (id: string) => `/cart/items/${id}`,

  // Orders
  ORDERS: "/orders",
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,

  // Addresses
  ADDRESSES: "/addresses",
  ADDRESS_BY_ID: (id: string) => `/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) => `/addresses/${id}/set-default`,

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
};
