// API Base URL - Change this to your backend URL
// export const API_URL = "http://localhost:3000/api"; // Only works on emulator

// For testing on physical device, use your computer's IP address
export const API_URL = "http://192.168.1.9:3000/api";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  PROFILE: "/auth/profile",

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
};
