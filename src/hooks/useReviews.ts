
import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export const useReviews = (productId: string) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Review[];
      setReviews(reviewsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [productId]);

  const addReview = async (rating: number, comment: string) => {
    if (!user) return;

    await addDoc(collection(db, 'reviews'), {
      userId: user.uid,
      productId,
      rating,
      comment,
      createdAt: new Date()
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return { reviews, loading, addReview, averageRating };
};
