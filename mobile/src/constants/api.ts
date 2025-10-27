// API Base URL - Change this to your backend URL
export const API_URL = 'http://localhost:3000/api';

// For testing on physical device, replace localhost with your computer's IP
// export const API_URL = 'http://192.168.1.100:3000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,

  // Categories & Brands
  CATEGORIES: '/categories',
  BRANDS: '/brands',

  // Cart (to be implemented)
  CART: '/cart',
  CART_ITEMS: '/cart/items',

  // Orders (to be implemented)
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
};
