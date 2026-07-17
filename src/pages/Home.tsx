import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Headset, ArrowRight } from 'lucide-react';
import CategoriesNavigation from '../components/CategoriesNavigation';
import { categories } from '@/data/categories';

// Reveal-on-scroll for below-the-fold sections only — the hero renders
// statically so the largest contentful paint isn't delayed by animation.
const SectionReveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <motion.section
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    {children}
  </motion.section>
);

const heroTrustItems = [
  { icon: ShieldCheck, label: 'Secure Pesapal checkout' },
  { icon: Truck, label: 'Delivery across Kenya' },
  { icon: Headset, label: 'Expert technical support' },
];

const whyChooseUs = [
  {
    icon: ShieldCheck,
    title: 'Genuine Products',
    text: 'We stock only genuine equipment from trusted manufacturers, backed by warranty.',
  },
  {
    icon: Truck,
    title: 'Countrywide Delivery',
    text: 'Fast, reliable delivery to Nairobi and every county in Kenya.',
  },
  {
    icon: Headset,
    title: 'Expert Support',
    text: 'Our technical team helps you pick the right product — before and after purchase.',
  },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchFeatured() {
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
      } catch {
        // Fail quietly — the section is hidden when there's nothing to show.
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="max-w-full overflow-x-hidden">
      {/* Hero */}
      <section className="hero-gradient text-white">
        <div className="container mx-auto px-4 py-14 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Copy */}
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-white/70 mb-4">
                Nairobi, Kenya · ICT &amp; Electrical Supplier
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.1] tracking-tight mb-5">
                ICT &amp; Electrical Supplies, Delivered Across Kenya
              </h1>
              <p className="text-lg sm:text-xl text-white/85 mb-8 max-w-xl">
                Genuine laptops, networking gear, CCTV, solar and electrical
                materials for homes, offices and enterprises.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white text-base px-8">
                  <Link to="/shop">
                    Shop Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white text-base px-8"
                >
                  <Link to="/contact">Talk to an Expert</Link>
                </Button>
              </div>

              {/* Trust strip */}
              <ul className="flex flex-wrap gap-x-6 gap-y-3 mt-10">
                {heroTrustItems.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2 text-sm text-white/80">
                    <Icon className="w-4 h-4 text-white/60" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Category imagery */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {categories.map((category, i) => (
                <Link
                  key={category.value}
                  to={`/shop?category=${category.value}`}
                  className={`group relative rounded-xl overflow-hidden aspect-[4/3] ring-1 ring-white/15 ${i % 2 === 1 ? 'translate-y-6' : ''}`}
                >
                  <img
                    src={category.image}
                    alt={category.display}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(216_80%_12%/0.85)] to-transparent" />
                  <span className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white">
                    {category.display}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoriesNavigation />

      {/* Featured Products — hidden until there's something to show */}
      {!loading && featuredProducts.length > 0 && (
        <SectionReveal>
          <section className="container mx-auto px-4 pb-16 max-w-full">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-h1">Featured Products</h2>
              <p className="text-lead mt-2">Our most popular and trusted products</p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-8 max-w-full">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" asChild variant="outline" className="text-base px-8">
                <Link to="/shop">View All Products</Link>
              </Button>
            </div>
          </section>
        </SectionReveal>
      )}

      {/* Why Choose Us */}
      <SectionReveal>
        <section className="bg-muted py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-full">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-h1">Why Buy From Bloom Tech Hub?</h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {whyChooseUs.map(({ icon: Icon, title, text }) => (
                <div key={title} className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-h3 mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
};

export default Home;
