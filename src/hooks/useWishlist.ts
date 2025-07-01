
import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'wishlists'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate() || new Date()
      })) as WishlistItem[];
      setWishlistItems(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addToWishlist = async (productId: string) => {
    if (!user) return;

    await addDoc(collection(db, 'wishlists'), {
      userId: user.uid,
      productId,
      addedAt: new Date()
    });
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    await deleteDoc(doc(db, 'wishlists', wishlistItemId));
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  return { wishlistItems, loading, addToWishlist, removeFromWishlist, isInWishlist };
};
