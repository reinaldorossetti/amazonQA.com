export type Role = 'admin' | 'user';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  person_type?: 'PF' | 'PJ';
  roles?: Role[];
  isAdmin?: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
  manufacturer?: string;
  line?: string;
  model?: string;
}

export interface CartItem {
  id: number;
  quantity: number;
  product_id: number;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  grand_total: number;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  items?: OrderItem[];
}

export interface Payment {
  id: number;
  order_id: number;
  method: 'credit' | 'debit' | 'pix' | 'boleto';
  amount: number;
  status: string;
  metadata?: Record<string, unknown>;
}
