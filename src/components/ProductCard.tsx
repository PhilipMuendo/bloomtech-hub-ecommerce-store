import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import WishlistButton from './WishlistButton';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    });
    toast({ title: 'Added to cart!', description: product.name });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="transition duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="flex-1">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.featured && (
            <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 text-xs font-medium rounded">
              Featured
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-1">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
              {product.category === 'ict' ? 'ICT Equipment' : 
               product.category === 'security' ? 'Security Systems' :
               product.category === 'power' ? 'Power Solutions' : 
               'Electrical Materials'}
            </span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 space-y-2">
        <div className="flex space-x-2 w-full">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 bg-accent hover:bg-accent/90"
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          <WishlistButton productId={product.id} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
