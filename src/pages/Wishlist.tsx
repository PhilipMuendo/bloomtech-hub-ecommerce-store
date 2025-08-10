import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRealTimeUpdates, REAL_TIME_EVENTS } from '@/utils/realTimeUpdates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const fetchWishlist = async (token: string) => {
  const res = await fetch('/api/wishlist', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch wishlist');
  return res.json();
};

const removeFromWishlist = async ({ wishlistItemId, token }: { wishlistItemId: string; token: string }) => {
  const res = await fetch(`/api/wishlist/${wishlistItemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to remove from wishlist');
  return wishlistItemId;
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
    refetch
  } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => fetchWishlist(token!),
    enabled: !!token,
  });

  // Auto-refresh wishlist when wishlist is updated
  useRealTimeUpdates([REAL_TIME_EVENTS.WISHLIST_UPDATED], () => {
    refetch();
  });

  const removeMutation = useMutation({
    mutationFn: ({ wishlistItemId, token }: { wishlistItemId: string; token: string }) => removeFromWishlist({ wishlistItemId, token }),
    onSuccess: (wishlistItemId) => {
      // Update the cache by filtering out the removed item
      queryClient.setQueryData(['wishlist'], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((item: any) => item.id.toString() !== wishlistItemId.toString());
      });
      
      // Also invalidate the query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast({ title: 'Removed from wishlist' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove from wishlist', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-16 text-center">Loading your wishlist...</div>;
  }
  if (isError) {
    toast({ title: 'Error', description: 'Failed to load wishlist.', variant: 'destructive' });
    return null;
  }
  if (!wishlist || (wishlist as any[]).length === 0) {
    console.log('EMPTY WISHLIST STATE TRIGGERED', wishlist);
    return (
      <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-16 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Your Wishlist</h1>
        <p className="text-muted-foreground mb-3 sm:mb-4 text-base sm:text-lg">No items in your wishlist. Browse our shop and add products you love!</p>
        <Link to="/shop">
          <Button className="text-base sm:text-lg px-6 py-3">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Your Wishlist</h1>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {(wishlist as any[]).map((item: any, idx: number) => {
          // The backend returns wishlist items with included Product data
          const product = item.Product || item.product;
          if (!product) return null;
          
          const productId = product.id;
          const productName = product.name;
          const productPrice = product.price;
          const productImage = product.imageUrl; // Backend uses imageUrl field
          const productDescription = product.description;
          const inStock = product.stock > 0; // Check stock instead of inStock

          return (
            <Card key={item.id || idx} className="group hover:shadow-lg transition-all duration-300 overflow-hidden w-full max-w-xs mx-auto">
              <CardContent className="p-3 sm:p-4">
                {/* Image Container */}
                <div className="relative aspect-square mb-3 sm:mb-4 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  
                  {/* Out of Stock Badge */}
                  {!inStock && (
                    <Badge className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-red-500 text-white text-xs sm:text-sm px-2 py-0.5">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Link to={`/product/${productId}`} className="block">
                    <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 hover:text-primary transition-colors">
                      {productName}
                    </h3>
                  </Link>
                  
                  {productDescription && (
                    <p className="text-muted-foreground text-xs line-clamp-2">
                      {productDescription}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base sm:text-lg text-primary">
                      KES {productPrice?.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        addToCart({
                          id: productId,
                          name: productName,
                          price: productPrice,
                          image: productImage,
                          category: product.category,
                        });
                        toast({ title: 'Added to cart!', description: productName });
                      }}
                      disabled={!inStock}
                      className="flex items-center gap-1 w-full xs:w-auto"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span className="hidden xs:inline">Add to Cart</span>
                      <span className="xs:hidden">Add</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => item.id && removeMutation.mutate({ wishlistItemId: item.id.toString(), token: token! })}
                      disabled={removeMutation.status === 'pending'}
                      className="flex items-center gap-1 w-full xs:w-auto border-red-200 hover:border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="hidden xs:inline text-red-600">Remove</span>
                      <span className="xs:hidden text-red-600">Remove</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist; 