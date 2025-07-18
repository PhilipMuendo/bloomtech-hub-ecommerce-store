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
  image: string;
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

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: 'Please log in to add items to your cart.' });
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-4">
        {/* Image Container */}
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
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
              src={product.image}
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
            <Badge className="absolute top-2 left-2 bg-primary text-white">
              Featured
            </Badge>
          )}

          {/* Out of Stock Badge */}
          {!product.inStock && (
            <Badge className="absolute bottom-2 left-2 bg-red-500 text-white">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-primary">
              KES {product.price.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex items-center gap-1"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
            <WishlistButton
              productId={product.id}
              iconOnly
              className="bg-white/80 hover:bg-white rounded-full shadow border border-gray-200"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
