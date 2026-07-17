import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '@/data/categories';

// Static category grid — replaces the previous auto-rotating carousel.
// Photo cards with a navy scrim keep the palette consistent with the brand
// instead of per-category rainbow colors.
const CategoriesNavigation = () => {
  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-h1">Shop by Category</h2>
          <p className="text-lead mt-2">
            ICT equipment, electrical materials, security and power — all in one place
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.value}
              to={`/shop?category=${category.value}`}
              className="group relative rounded-xl overflow-hidden aspect-[4/3] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <img
                src={category.image}
                alt={category.display}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(216_80%_12%/0.92)] via-[hsl(216_80%_14%/0.45)] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                <h3 className="text-lg font-semibold">{category.display}</h3>
                <p className="text-sm text-white/80 mt-1 line-clamp-2">{category.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium mt-3 text-white/90 group-hover:text-white">
                  Browse
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesNavigation;
