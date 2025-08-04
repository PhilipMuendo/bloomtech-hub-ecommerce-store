import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/ProductCard';
// import { getFeaturedProducts } from '@/data/products';
import { motion } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import CategoriesNavigation from '../components/CategoriesNavigation';

// SectionReveal component for reusability
const SectionReveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <motion.section
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.7, ease: 'easeOut' }}
  >
    {children}
  </motion.section>
);

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/products/featured');
        if (!res.ok) throw new Error('Failed to fetch featured products');
        const data = await res.json();
        setFeaturedProducts(data.map((p: any) => ({
          ...p,
          id: p.id,
          imageUrl: p.imageUrl || '/placeholder.svg',
          inStock: typeof p.inStock === 'boolean' ? p.inStock : (typeof p.stock === 'number' ? p.stock > 0 : true),
        })));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <SectionReveal>
        <section className="hero-gradient text-white py-16 sm:py-20">
          <div className="container mx-auto px-2 sm:px-4 text-center max-w-full">
            <div className="animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
                Your Tech Solutions Hub
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto">
                Premium ICT equipment and electrical materials for professionals, 
                businesses, and tech enthusiasts across Kenya.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100 text-base sm:text-lg px-6 py-3">
                  <Link to="/shop">Shop Now</Link>
                </Button>
                <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100 text-base sm:text-lg px-6 py-3">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Categories Navigation */}
      <CategoriesNavigation />

      {/* Featured Products */}
      <SectionReveal>
        <section className="container mx-auto px-2 sm:px-4 max-w-full">
          <div className="text-center mb-8 sm:mb-12 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Featured Products</h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Our most popular and trusted products
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading featured products...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8 max-w-full">
            {featuredProducts.map((product) => (
              <div key={product.id} className="animate-scale-in">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          )}

          <div className="text-center">
            <Button size="lg" asChild variant="outline" className="text-base sm:text-lg px-6 py-3">
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>
        </section>
      </SectionReveal>

      {/* Why Choose Us */}
      <section className="bg-muted py-10 sm:py-16">
        <div className="container mx-auto px-2 sm:px-4 max-w-full">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Why Choose BLOOMTECH Hub?</h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              We're committed to providing the best technology solutions
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3 max-w-full">
            <div className="text-center animate-slide-up">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl text-white">✓</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Quality Products</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                We source only the highest quality equipment from trusted manufacturers
              </p>
            </div>

            <div className="text-center animate-slide-up">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl text-white">⚡</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Quick and reliable delivery across Kenya with tracking support
              </p>
            </div>

            <div className="text-center animate-slide-up">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl text-white">☎</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Expert Support</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Our technical team is ready to help with product selection and support
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
