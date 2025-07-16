import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import { getProductById } from '@/data/products'; // Remove static import
import { useCart } from '@/context/CartContext';
import { ArrowLeft } from 'lucide-react';
import WishlistButton from '@/components/WishlistButton';
import ReviewForm from '@/components/ReviewForm';
import ReviewsList from '@/components/ReviewsList';
import BackInStockAlert from '@/components/BackInStockAlert';
import { useToast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/products/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          setProduct(null);
          setError('Product Not Found');
        } else if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Failed to fetch product');
        } else {
          const data = await res.json();
          setProduct(data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch product');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
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
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      });
      toast({ title: 'Added to cart!', description: product.name });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to add to cart', variant: 'destructive' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Add after product is loaded
  const isInStock = typeof product.inStock === 'boolean'
    ? product.inStock
    : typeof product.stock === 'number'
      ? product.stock > 0
      : false;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6">
        <Button variant="ghost" asChild className="mb-2 sm:mb-4">
          <Link to="/shop" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={product.imageUrl || product.image || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-64 sm:h-96 lg:h-[500px] object-cover"
            />
            {product.featured && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-accent text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded">
                Featured
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            <span className="text-xs sm:text-sm bg-muted px-2 sm:px-3 py-1 rounded capitalize text-muted-foreground">
              {product.category === 'ict' ? 'ICT Equipment' : 
               product.category === 'security' ? 'Security Systems' :
               product.category === 'power' ? 'Power Solutions' : 
               'Electrical Materials'}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-3 sm:mt-4 mb-3 sm:mb-4">
              {product.name}
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">
              {formatPrice(product.price)}
            </p>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Specifications</h2>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <ul className="space-y-2">
                  {(product.specifications || []).map((spec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-accent font-medium">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-xs sm:text-sm font-medium">
                Stock Status:
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                isInStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isInStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            {isInStock && typeof product.stock === 'number' && product.stock < 10 && product.stock > 0 && (
              <div className="text-xs sm:text-sm text-red-600 font-semibold mt-1">
                Only {product.stock} left in stock!
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock}
                size="lg"
                className="flex-1 bg-accent hover:bg-accent/90 text-base"
              >
                {isInStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <WishlistButton productId={product.id} />
            </div>

            <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <p>• Free delivery within Nairobi</p>
              <p>• 30-day return policy</p>
              <p>• Warranty included</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back in Stock Alert */}
      {!isInStock && (
        <div className="mt-6 sm:mt-8">
          <BackInStockAlert productId={product.id} />
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-10 sm:mt-16 space-y-6 sm:space-y-8">
        <h2 className="text-xl sm:text-2xl font-bold">Customer Reviews</h2>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          <ReviewForm productId={product.id} />
          <ReviewsList productId={product.id} />
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-10 sm:mt-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Products</h2>
        <div className="text-center text-muted-foreground">
          <p>Explore more products in our shop</p>
          <Button asChild className="mt-3 sm:mt-4">
            <Link to={`/shop?category=${product.category}`}>
              View More {product.category === 'ict' ? 'ICT Equipment' : 
                         product.category === 'security' ? 'Security Systems' :
                         product.category === 'power' ? 'Power Solutions' : 
                         'Electrical Materials'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
