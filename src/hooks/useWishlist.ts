import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: Date;
}

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addToWishlist = async (productId: string) => {
    if (!user) return;
    const newItem: WishlistItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      userId: user.email,
      addedAt: new Date(),
    };
    setWishlistItems(prev => [newItem, ...prev]);
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  return { wishlistItems, loading, addToWishlist, removeFromWishlist, isInWishlist };
};
