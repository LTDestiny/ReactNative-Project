export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: "customer" | "admin";
  created_at: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  brand_name?: string;
  brand_slug?: string;
  category_name?: string;
  category_slug?: string;
  stock?: number;
  images: ProductImage[];
  avg_rating?: number;
  review_count?: number;
  weight_grams?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  position: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  added_at: string;
  product_id: string;
  product_name: string;
  price: number;
  sale_price?: number;
  sku?: string;
  image_url?: string;
  stock: number;
  brand_name?: string;
}

export interface Cart {
  cart_id: string;
  items: CartItem[];
  subtotal: string;
  item_count: number;
}

export interface Address {
  id: string;
  user_id: string;
  label?: string;
  address_line: string;
  city: string;
  district?: string;
  postal_code?: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  address_id?: string;
  total_amount: number;
  shipping_fee: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
  address_line?: string;
  city?: string;
  district?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface OrderDetail {
  order: Order & {
    address_label?: string;
    postal_code?: string;
    delivery_phone?: string;
  };
  items: OrderItem[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}
