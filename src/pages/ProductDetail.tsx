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
import ProductCard from '@/components/ProductCard';
import GetQuoteModal from '@/components/GetQuoteModal';
import { useAuth } from '@/context/AuthContext';
import { Tag } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showQuote, setShowQuote] = React.useState(false);

  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [relatedProducts, setRelatedProducts] = React.useState<any[]>([]);

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

  // Fetch related products by category (excluding current product)
  React.useEffect(() => {
    if (!product || !product.category) return;
    fetch(`/api/products?category=${product.category}&limit=5`)
      .then(async (res) => {
        if (!res.ok) return setRelatedProducts([]);
        const data = await res.json();
        // Exclude current product and limit to 4
        const filtered = (data.products || data).filter((p: any) => p.id !== product.id && p._id !== product.id).slice(0, 4);
        setRelatedProducts(filtered);
      })
      .catch(() => setRelatedProducts([]));
  }, [product]);

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
      }, quantity);
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
      <div className="sticky top-0 z-30 bg-white py-2 mb-4 sm:mb-6 shadow-sm flex items-center">
        <Button variant="default" asChild size="lg" className="flex items-center space-x-2 px-5 py-2 text-base font-semibold">
          <Link to="/shop">
            <ArrowLeft className="w-5 h-5 mr-2" />
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
              srcSet={
                product.imageUrl || product.image
                  ? `${product.imageUrl || product.image}?w=400 400w, ${product.imageUrl || product.image}?w=800 800w, ${product.imageUrl || product.image}?w=1200 1200w`
                  : undefined
              }
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
              alt={product.name || 'Product image'}
              className="w-full h-64 sm:h-96 lg:h-[500px] object-cover"
              loading="lazy"
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
                {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                  <ul className="space-y-2">
                    {product.specifications.map((spec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-accent font-medium">•</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground text-sm">No specifications available.</div>
                )}
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
              <div className="flex items-center mb-2 sm:mb-0">
                <label htmlFor="quantity" className="mr-2 text-sm font-medium">Qty:</label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={typeof product.stock === 'number' ? product.stock : 99}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Math.min(Number(e.target.value), typeof product.stock === 'number' ? product.stock : 99)))}
                  className="w-16 border rounded px-2 py-1 text-center"
                  disabled={!isInStock}
                />
              </div>
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
          <ReviewForm productId={product._id} />
          <ReviewsList productId={product._id} />
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-10 sm:mt-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Products</h2>
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id || prod._id} product={{
                ...prod,
                id: prod.id || prod._id,
                image: prod.image || prod.imageUrl || '/placeholder.svg',
                inStock: typeof prod.inStock === 'boolean' ? prod.inStock : (typeof prod.stock === 'number' ? prod.stock > 0 : true),
              }} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>No related products found.</p>
            <Button asChild className="mt-3 sm:mt-4">
              <Link to={`/shop?category=${product.category}`}>
                View More {product.category === 'ict' ? 'ICT Equipment' : 
                           product.category === 'security' ? 'Security Systems' :
                           product.category === 'power' ? 'Power Solutions' : 
                           'Electrical Materials'}
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Add below Add to Cart button */}
      <Button
        variant="secondary"
        className="w-full flex items-center gap-2 mt-4 border-dashed border-2 border-accent hover:bg-accent/10"
        onClick={() => setShowQuote(true)}
      >
        <Tag className="w-5 h-5 text-accent" />
        Request Bulk Quote
      </Button>
      <GetQuoteModal
        open={showQuote}
        onOpenChange={setShowQuote}
        items={[{ productId: product.id || product._id, name: product.name, quantity }]}
        userInfo={user ? { name: user.name, email: user.email, ...(user.phone ? { phone: user.phone } : {}) } : {}}
      />
    </div>
  );
};

export default ProductDetail;
