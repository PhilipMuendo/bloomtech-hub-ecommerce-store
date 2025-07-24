import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, className }) => {
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Determine if the product is in the wishlist
  const inWishlist = isInWishlist ? isInWishlist(productId) : wishlist?.some((item: any) => item.productId === productId);

  const handleClick = async () => {
    if (!user) {
      toast({ title: 'Please log in to use your wishlist.' });
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
        toast({ title: 'Removed from wishlist.' });
      } else {
        await addToWishlist(productId);
        toast({ title: 'Added to wishlist!' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update wishlist', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={inWishlist ? 'destructive' : 'outline'}
      onClick={handleClick}
      disabled={loading || wishlistLoading}
      className={className}
      aria-pressed={inWishlist}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={`w-4 h-4 mr-2 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
      {loading || wishlistLoading
        ? 'Processing...'
        : inWishlist
        ? 'Remove from Wishlist'
        : 'Add to Wishlist'}
    </Button>
  );
};

export default WishlistButton;
