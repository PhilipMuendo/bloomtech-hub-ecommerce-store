
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  category: string;
}

interface CartContextType {
  cartItems: CartItem[];
  /** Returns true if the product was already in the cart (quantity unchanged). */
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Lazy initializer so we read localStorage once, not on every render.
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);

  // Persist across refreshes so the cart isn't lost.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>, quantity: number = 1): boolean => {
    let alreadyInCart = false;
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        alreadyInCart = true;
        // Do not increase quantity if already in cart
        return prev;
      }
      return [...prev, { ...product, quantity }];
    });
    return alreadyInCart;
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems(prev => {
      if (quantity <= 0) {
        return prev.filter(item => item.id !== id);
      }
      return prev.map(item => (item.id === id ? { ...item, quantity } : item));
    });
  }, []);

  const getTotalPrice = useCallback(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const clearCart = useCallback(() => setCartItems([]), []);

  // Memoize so consumers don't re-render on every provider render.
  const value = useMemo<CartContextType>(
    () => ({ cartItems, addToCart, removeFromCart, updateQuantity, getTotalPrice, clearCart }),
    [cartItems, addToCart, removeFromCart, updateQuantity, getTotalPrice, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
