import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  status?: string;
}

export const useReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch reviews for this product
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/product/${productId}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(
        data.map((r: any) => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt) : undefined
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [productId, user?.token]);

  const addReview = async (rating: number, comment: string) => {
    if (!user || !user.token) throw new Error('Not authenticated');
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId, rating, comment })
      });
      if (!res.ok) throw new Error('Failed to submit review');
      await fetchReviews(); // Refresh reviews after adding
    } finally {
      setLoading(false);
    }
  };

  // Star breakdown for summary
  const starBreakdown = [1, 2, 3, 4, 5].map(star =>
    reviews.filter(r => r.rating === star).length
  );

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return { reviews, loading, addReview, averageRating, starBreakdown };
};
