import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Home, ChevronRight, Tag } from 'lucide-react';
import WishlistButton from '@/components/WishlistButton';
import ReviewForm from '@/components/ReviewForm';
import ReviewsList from '@/components/ReviewsList';
import BackInStockAlert from '@/components/BackInStockAlert';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import GetQuoteModal from '@/components/GetQuoteModal';
import { useAuth } from '@/context/AuthContext';

// Type definitions
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
  subcategory?: string;
  description?: string;
  stock?: number;
  inStock?: boolean;
  featured?: boolean;
  reviews?: any[];
  productId?: string; // Add this for backward compatibility
}

interface RelatedProduct extends Product {
  productId?: string;
}

// Skeleton loader for product
const ProductSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-200 h-[340px] w-full rounded-lg" />
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded w-1/4" />
        <div className="h-32 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const [showQuote, setShowQuote] = React.useState(false);

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [relatedProducts, setRelatedProducts] = React.useState<RelatedProduct[]>([]);
  const [imageError, setImageError] = React.useState(false);

  // Sticky Add to Cart bar (mobile)
  const [showStickyBar, setShowStickyBar] = React.useState(false);
  
  // Helper function for category display names
  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'ict': return 'ICT Equipment';
      case 'security': return 'Security Systems';
      case 'power': return 'Power Solutions';
      default: return 'Electrical Materials';
    }
  };
  
  React.useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.innerWidth < 768 && window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch product data
  React.useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    setImageError(false);
    
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        
        if (response.status === 404) {
          setProduct(null);
          setError('Product Not Found');
        } else if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(data.error || 'Failed to fetch product');
        } else {
          const data = await response.json();
          setProduct(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch related products by category (excluding current product)
  React.useEffect(() => {
    if (!product?.category) return;
    
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${product.category}&limit=5`);
        
        if (!response.ok) {
          setRelatedProducts([]);
          return;
        }
        
        const data = await response.json();
        const products = data.products || data;
        
        // Exclude current product and limit to 4
        const filtered = products
          .filter((p: RelatedProduct) => {
            const pId = p.id || p.productId;
            const currentId = product.id || product.productId;
            return pId !== currentId;
          })
          .slice(0, 4);
        
        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Failed to fetch related products:', error);
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
  }, [product?.category, product?.id]);

  // Memoized values for performance
  const isInStock = React.useMemo(() => {
    if (!product) return false;
    return typeof product.inStock === 'boolean'
      ? product.inStock
      : typeof product.stock === 'number'
        ? product.stock > 0
        : false;
  }, [product]);

  const formatPrice = React.useCallback((price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  }, []);

  const handleAddToCart = React.useCallback(() => {
    if (!product) return;
    
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category
      }, quantity);
      toast({ title: 'Added to cart!', description: product.name });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.message || 'Failed to add to cart', 
        variant: 'destructive' 
      });
    }
  }, [product, quantity, addToCart, toast]);

  const handleQuantityChange = React.useCallback((newQuantity: number) => {
    const maxStock = typeof product?.stock === 'number' ? product.stock : 99;
    setQuantity(Math.max(1, Math.min(newQuantity, maxStock)));
  }, [product?.stock]);

  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', to: '/' },
    { name: 'Shop', to: '/shop' },
    { name: getCategoryDisplayName(product.category), to: `/shop?category=${product.category}` },
    ...(product.subcategory ? [{ name: product.subcategory, to: `/shop?category=${product.category}&subcategory=${product.subcategory}` }] : []),
    { name: product.name, to: location.pathname }
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-4 gap-2" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.to} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="w-4 h-4" />}
            <Link 
              to={crumb.to} 
              className={idx === breadcrumbs.length - 1 ? "font-semibold text-primary" : "hover:underline"}
              aria-current={idx === breadcrumbs.length - 1 ? "page" : undefined}
            >
              {idx === 0 ? <Home className="w-4 h-4 inline" /> : crumb.name}
            </Link>
          </span>
        ))}
      </nav>

      {/* Back to Shop */}
      <div className="mb-4">
        <Button variant="default" asChild size="lg" className="flex items-center space-x-2 px-5 py-2 text-base font-semibold">
          <Link to="/shop">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Shop</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
        {/* Product Image */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="relative overflow-hidden rounded-lg bg-white shadow-md flex flex-col items-center justify-center p-2" style={{ minWidth: '300px', maxWidth: '340px', margin: '0 auto' }}>
            <img
              src={imageError ? '/placeholder.svg' : (product.imageUrl || '/placeholder.svg')}
              srcSet={
                product.imageUrl && !imageError
                  ? `${product.imageUrl}?w=320 320w, ${product.imageUrl}?w=400 400w, ${product.imageUrl}?w=600 600w`
                  : undefined
              }
              sizes="(max-width: 640px) 100vw, 340px"
              alt={product.name || 'Product image'}
              className="w-[320px] h-[320px] sm:w-[340px] sm:h-[340px] object-contain border rounded-lg bg-white"
              loading="lazy"
              onError={handleImageError}
            />
            {product.featured && (
              <div className="absolute top-3 left-3 bg-accent text-white px-2 py-1 text-xs font-medium rounded">
                Featured
              </div>
            )}
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="bg-muted px-2 sm:px-3 py-1 rounded capitalize text-muted-foreground">
                {getCategoryDisplayName(product.category)}
              </span>
              {product.subcategory && (
                <span className="bg-muted px-2 sm:px-3 py-1 rounded capitalize text-muted-foreground">
                  {product.subcategory}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 sm:mt-3 mb-2 sm:mb-3">
              {product.name}
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-2 sm:mb-3">
              {formatPrice(product.price)}
            </p>
          </div>

          <Card className="mb-2">
            <CardContent className="p-3">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Product details</h2>
              {product.description ? (
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm sm:text-base">
                  {product.description.split(/\.|\n|\r/).filter(point => point.trim().length > 0).map((point, idx) => (
                    <li key={idx}>{point.trim()}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground text-sm">No description available.</div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
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

            {/* Grouped Actions */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <div className="flex items-center gap-2">
                <label htmlFor="quantity" className="mr-2 text-sm font-medium">Qty:</label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={typeof product.stock === 'number' ? product.stock : 99}
                  value={quantity}
                  onChange={e => handleQuantityChange(Number(e.target.value))}
                  className="w-14 border rounded px-2 py-1 text-center text-sm"
                  disabled={!isInStock}
                  aria-label="Quantity"
                />
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="bg-accent hover:bg-accent/90 text-sm font-medium py-2 px-4 rounded-md min-w-[120px] h-[40px]"
                aria-label={isInStock ? 'Add to cart' : 'Out of stock'}
              >
                {isInStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <WishlistButton productId={product.id} className="text-sm font-medium py-2 px-4 rounded-md min-w-[120px] h-[40px]" />
            </div>

            {/* Request Bulk Quote Button */}
            <Button
              variant="secondary"
              className="px-6 py-2 flex items-center gap-2 border-dashed border-2 border-accent hover:bg-accent/10 rounded-md text-base mt-2"
              style={{ minWidth: '220px', maxWidth: '320px' }}
              onClick={() => setShowQuote(true)}
              aria-label="Request bulk quote"
            >
              <Tag className="w-5 h-5 text-accent" />
              Request Bulk Quote
            </Button>

            <div className="text-xs sm:text-sm text-muted-foreground space-y-1 mt-2">
              <p>• Free delivery within Nairobi</p>
              <p>• 30-day return policy</p>
              <p>• Warranty included</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back in Stock Alert */}
      {!isInStock && (
        <div className="mt-8">
          <BackInStockAlert productId={product.id} />
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-8 sm:mt-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          Customer Reviews
          <span className="text-base font-normal text-muted-foreground">
            ({product.reviews?.length || 0} reviews)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
            {user ? (
              <ReviewForm productId={product.id} />
            ) : (
              <div className="text-muted-foreground mb-4">
                <Link to="/login" className="text-primary underline">Log in</Link> to write a review.
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">All Reviews</h3>
            <ReviewsList productId={product.id} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16 sm:mt-20">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Products</h2>
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard 
                key={prod.id} 
                product={{
                  ...prod,
                  id: prod.id,
                  imageUrl: prod.imageUrl || '/placeholder.svg',
                  inStock: typeof prod.inStock === 'boolean' ? prod.inStock : (typeof prod.stock === 'number' ? prod.stock > 0 : true),
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>No related products found.</p>
            <Button asChild className="mt-3 sm:mt-4">
              <Link to={`/shop?category=${product.category}`}>
                View More {getCategoryDisplayName(product.category)}
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Quote Modal */}
      <GetQuoteModal
        open={showQuote}
        onOpenChange={setShowQuote}
        items={[{ productId: product.id, name: product.name, quantity }]}
        userInfo={user ? { name: user.name, email: user.email } : {}}
      />

      {/* Sticky Add to Cart Bar (Mobile) */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50 flex items-center justify-between px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={typeof product.stock === 'number' ? product.stock : 99}
              value={quantity}
              onChange={e => handleQuantityChange(Number(e.target.value))}
              className="w-12 border rounded px-2 py-1 text-center text-sm"
              disabled={!isInStock}
              aria-label="Quantity"
            />
            <span className="font-medium">{product.name}</span>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className="bg-accent hover:bg-accent/90 text-sm font-medium py-2 px-4 rounded-md min-w-[100px] h-[40px]"
            aria-label={isInStock ? 'Add to cart' : 'Out of stock'}
          >
            {isInStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
