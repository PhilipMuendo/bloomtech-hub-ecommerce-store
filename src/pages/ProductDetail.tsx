
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProductById } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { ArrowLeft } from 'lucide-react';
import WishlistButton from '@/components/WishlistButton';
import ReviewForm from '@/components/ReviewForm';
import ReviewsList from '@/components/ReviewsList';
import BackInStockAlert from '@/components/BackInStockAlert';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const product = id ? getProductById(id) : null;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/shop" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 lg:h-[500px] object-cover"
            />
            {product.featured && (
              <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 text-sm font-medium rounded">
                Featured
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-medium text-lg">Out of Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <span className="text-sm bg-muted px-3 py-1 rounded capitalize text-muted-foreground">
              {product.category === 'ict' ? 'ICT Equipment' : 'Electrical Materials'}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold mt-4 mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary mb-6">
              {formatPrice(product.price)}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Specifications</h2>
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {product.specifications.map((spec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-accent font-medium">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                Stock Status:
              </span>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                product.inStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                size="lg"
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <WishlistButton productId={product.id} />
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Free delivery within Nairobi</p>
              <p>• 30-day return policy</p>
              <p>• Warranty included</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back in Stock Alert */}
      {!product.inStock && (
        <div className="mt-8">
          <BackInStockAlert productId={product.id} />
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-16 space-y-8">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReviewForm productId={product.id} />
          <ReviewsList productId={product.id} />
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="text-center text-muted-foreground">
          <p>Explore more products in our shop</p>
          <Button asChild className="mt-4">
            <Link to={`/shop?category=${product.category}`}>
              View More {product.category === 'ict' ? 'ICT Equipment' : 'Electrical Materials'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
