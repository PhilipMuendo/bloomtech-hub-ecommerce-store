import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

export const useWishlist = () => {
  const { user } = useAuth();
  const token = user?.token;
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      return res.json();
    },
    enabled: !!token,
  });

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.token) throw new Error('Not authenticated');
      if (!productId) throw new Error('No productId provided');
      // Validate productId is a valid number (MySQL uses integer IDs)
      if (!productId || isNaN(Number(productId))) throw new Error('Invalid productId format');
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ productId }), // <-- this is correct
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add to wishlist');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.token) throw new Error('Not authenticated');
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to remove from wishlist');
      }
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlist.some((item: any) =>
      (typeof item.productId === 'string' && item.productId === productId) ||
      (typeof item.productId === 'object' && item.productId?._id === productId) ||
      (item.product?._id === productId)
    );
  };

  return {
    wishlistItems: wishlist,
    loading: isLoading,
    addToWishlist: addMutation.mutateAsync,
    removeFromWishlist: removeMutation.mutateAsync,
    isInWishlist,
  };
};
