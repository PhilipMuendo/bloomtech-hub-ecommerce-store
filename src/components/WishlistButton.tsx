import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  iconOnly?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, className, iconOnly }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist, wishlistItems } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const inWishlist = isInWishlist(productId);
  const wishlistItem = wishlistItems.find(item => item.productId === productId);

  const handleWishlistClick = async () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    try {
      if (inWishlist && productId) {
        await removeFromWishlist(productId);
        toast({ title: "Removed from wishlist" });
      } else if (!inWishlist) {
        await addToWishlist(productId);
        toast({ title: "Added to wishlist" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update wishlist", variant: "destructive" });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size={iconOnly ? "icon" : "sm"}
        onClick={handleWishlistClick}
        className={`${inWishlist ? "text-red-500 border-red-500" : ""} ${className || ''}`}
        aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart className={`w-4 h-4 ${iconOnly ? '' : 'mr-2'} ${inWishlist ? "fill-current" : ""}`} />
        {!iconOnly && (inWishlist ? "Remove from Wishlist" : "Add to Wishlist")}
      </Button>
    </>
  );
};

export default WishlistButton;
