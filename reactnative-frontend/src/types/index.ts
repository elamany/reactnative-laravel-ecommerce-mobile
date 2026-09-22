
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductPage {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

export interface CheckoutResponse {
  order_id: number;
  tx_ref: string;
  amount: number;
  checkout_url: string;
}

export interface OrderSummary {
  id: number;
  tx_ref: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  items_count: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderDetail {
  id: number;
  tx_ref: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  checkout_url: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface OrderPage {
  data: OrderSummary[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}