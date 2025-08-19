export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin' | 'warehouse';
  token: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  stock: number;
  imageUrl: string;
  featured?: boolean;
}

export interface Message {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  productId: Pick<Product, 'id' | 'name'>;
  quantity: number;
  id: string;
}

export interface Quote {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  items: QuoteItem[];
  messages: Message[];
  status: 'pending' | 'responded' | 'closed' | 'declined';
  userSeen: boolean;
  adminSeen: boolean;
  orderCreated?: boolean;
  adminResponse?: string;
  finalPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewQuoteItem {
  productId: string;
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  customerName?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  productName?: string;
  Product?: Product;
}

export interface Transaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  transactionId?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  resultCode?: string;
  resultDesc?: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  Product?: Product;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  approved: boolean;
  helpful: boolean;
  createdAt: string;
  updatedAt: string;
  User?: User;
  Product?: Product;
} 