export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  token: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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