import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { Badge } from '@/components/ui/badge';
import WishlistButton from './WishlistButton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast({ title: 'Please log in to add items to your cart.' });
      return;
    }
    setAdding(true);
    await new Promise(res => setTimeout(res, 600)); // Simulate async
    const alreadyInCart = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category
    });
    setAdding(false);
    if (alreadyInCart) {
      toast({
        title: 'Product is already in your cart.',
        description: 'You can adjust the quantity in your cart.',
        duration: 1500 // 1.5 seconds
      });
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden w-full max-w-xs mx-auto">
      <CardContent className="p-3 sm:p-4">
        {/* Image Container */}
        <div className="relative aspect-square mb-3 sm:mb-4 overflow-hidden rounded-lg bg-gray-100">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-gray-200 w-full h-full"></div>
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-gray-400 text-sm">Image not available</div>
            </div>
          ) : (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* Featured Badge */}
          {product.featured && (
            <Badge className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-primary text-white text-xs sm:text-sm px-2 py-0.5">
              Featured
            </Badge>
          )}

          {/* Out of Stock Badge */}
          {!product.inStock && (
            <Badge className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-red-500 text-white text-xs sm:text-sm px-2 py-0.5">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1.5 sm:space-y-2">
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-base sm:text-lg text-primary">
              KES {product.price.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 mt-2">
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.inStock || adding}
              className="flex items-center gap-1 w-full xs:w-auto"
            >
              {adding ? (
                <span className="flex items-center"><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>Adding...</span>
              ) : added ? (
                <span className="flex items-center text-green-600"><svg className="h-4 w-4 mr-1" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" fill="none" /></svg>Added!</span>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden xs:inline">Add to Cart</span>
                  <span className="xs:hidden">Add</span>
                </>
              )}
            </Button>
            <WishlistButton
              productId={product.id}
              iconOnly
              className="bg-white/80 hover:bg-white rounded-full shadow border border-gray-200 w-full xs:w-auto"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
