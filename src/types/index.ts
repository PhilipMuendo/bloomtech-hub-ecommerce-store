export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  token: string;
  phone?: string;
}

export interface Product {
  _id: string;
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
  _id: string;
  sender: 'user' | 'admin';
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  productId: Pick<Product, '_id' | 'name'>;
  quantity: number;
  _id: string;
}

export interface Quote {
  _id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  items: QuoteItem[];
  messages: Message[];
  status: 'pending' | 'responded' | 'closed' | 'declined';
  userSeen: boolean;
  adminSeen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewQuoteItem {
  productId: string;
  name: string;
  quantity: number;
} 