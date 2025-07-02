import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts } from '@/data/products';
import { motion } from 'framer-motion';

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
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <SectionReveal>
        <section className="hero-gradient text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Your Tech Solutions Hub
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
                Premium ICT equipment and electrical materials for professionals, 
                businesses, and tech enthusiasts across Kenya.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100">
                  <Link to="/shop">Shop Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-primary">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Categories Section */}
      <SectionReveal>
        <section className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">
              Find exactly what you need for your technology and electrical projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="group card-hover overflow-hidden">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"
                  alt="ICT Equipment"
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">ICT Equipment</h3>
                  <p className="mb-4 opacity-90">
                    Laptops, networking gear, cables, and computer accessories
                  </p>
                  <Button asChild className="bg-accent hover:bg-accent/90">
                    <Link to="/shop?category=ict">Browse ICT</Link>
                  </Button>
                </CardContent>
              </div>
            </Card>

            <Card className="group card-hover overflow-hidden">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800"
                  alt="Electrical Materials"
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Electrical Materials</h3>
                  <p className="mb-4 opacity-90">
                    Circuit breakers, cables, sockets, switches, and tools
                  </p>
                  <Button asChild className="bg-accent hover:bg-accent/90">
                    <Link to="/shop?category=electrical">Browse Electrical</Link>
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      </SectionReveal>

      {/* Stats Section (Animated Counters) */}
      <SectionReveal>
        <section className="py-16 bg-muted">
          <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <AnimatedCounter value={1000} label="Happy Customers" />
            <AnimatedCounter value={500} label="Products Sold" />
            <AnimatedCounter value={50} label="Serving Cities" />
            <AnimatedCounter value={120} label="Trusted by Businesses" />
          </div>
        </section>
      </SectionReveal>

      {/* Featured Products */}
      <SectionReveal>
        <section className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground text-lg">
              Our most popular and trusted products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="animate-scale-in">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild variant="outline">
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>
        </section>
      </SectionReveal>

      {/* Why Choose Us */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose BLOOMTECH Hub?</h2>
            <p className="text-muted-foreground text-lg">
              We're committed to providing the best technology solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-muted-foreground">
                We source only the highest quality equipment from trusted manufacturers
              </p>
            </div>

            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Quick and reliable delivery across Kenya with tracking support
              </p>
            </div>

            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">☎</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-muted-foreground">
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
