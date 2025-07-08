import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/hooks/use-toast';

interface WishlistButtonProps {
  productId: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist, wishlistItems } = useWishlist();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);

  const inWishlist = isInWishlist(productId);
  const wishlistItem = wishlistItems.find(item => item.productId === productId);

  const handleWishlistClick = async () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    try {
      if (inWishlist && wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
        toast({ title: "Removed from wishlist" });
      } else {
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
        size="sm"
        onClick={handleWishlistClick}
        className={inWishlist ? "text-red-500 border-red-500" : ""}
      >
        <Heart className={`w-4 h-4 mr-2 ${inWishlist ? "fill-current" : ""}`} />
        {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      </Button>
    </>
  );
};

export default WishlistButton;
