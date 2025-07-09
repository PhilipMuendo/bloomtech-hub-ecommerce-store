import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const fetchWishlist = async (token: string) => {
  const res = await fetch('/api/wishlist', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch wishlist');
  return res.json();
};

const removeFromWishlist = async ({ productId, token }: { productId: string; token: string }) => {
  const res = await fetch(`/api/wishlist/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to remove from wishlist');
  return productId;
};

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const token = user?.token;
  const { addToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: wishlist,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => fetchWishlist(token!),
    enabled: !!token,
  });

  const removeMutation = useMutation({
    mutationFn: ({ productId, token }: { productId: string; token: string }) => removeFromWishlist({ productId, token }),
    onSuccess: (productId) => {
      queryClient.setQueryData(['wishlist'], (old: any) => old.filter((item: any) => item.product._id !== productId));
      toast({ title: 'Removed from wishlist' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove from wishlist', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="container mx-auto py-16 text-center">Loading your wishlist...</div>;
  }
  if (isError) {
    return <div className="container mx-auto py-16 text-center text-red-500">Failed to load wishlist.</div>;
  }
  if (!wishlist || (wishlist as any[]).length === 0) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Wishlist</h1>
        <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
        <Link to="/shop">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Wishlist</h1>
      {console.log('Wishlist data:', wishlist)}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(wishlist as any[]).map((item: any, idx: number) => {
          const product = item.product || item.productId;
          if (!product) return null;
          return (
            <Card key={product._id || idx} className="flex flex-col h-full">
              <Link to={`/product/${product._id}`} className="flex-1">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-md"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="text-xl font-bold text-primary mb-2">
                    KES {product.price?.toLocaleString()}
                  </div>
                </CardContent>
              </Link>
              <div className="flex gap-2 p-4 pt-0">
                <Button
                  variant="outline"
                  onClick={() => product._id && removeMutation.mutate({ productId: product._id, token: token! })}
                  disabled={removeMutation.status === 'pending'}
                >
                  Remove
                </Button>
                <Button
                  onClick={() => {
                    addToCart({
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      category: product.category,
                    });
                    toast({ title: 'Added to cart!', description: product.name });
                  }}
                  disabled={!product._id}
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist; 