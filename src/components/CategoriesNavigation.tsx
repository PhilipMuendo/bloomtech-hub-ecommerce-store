import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 1,
    title: 'Security Systems',
    description: 'CCTV cameras, alarms, and access control systems',
    image: '/lovable-uploads/8534e6a7-fa26-4261-afc5-f7710b5c4308.png',
    link: '/shop?category=security',
    bgColor: 'bg-red-500'
  },
  {
    id: 2,
    title: 'ICT Equipment',
    description: 'Laptops, computers, networking gear and accessories',
    image: '/placeholder.svg',
    link: '/shop?category=ict',
    bgColor: 'bg-blue-500'
  },
  {
    id: 3,
    title: 'Electrical Materials',
    description: 'Cables, circuit breakers, switches and electrical components',
    image: '/placeholder.svg',
    link: '/shop?category=electrical',
    bgColor: 'bg-green-500'
  },
  {
    id: 4,
    title: 'Power Solutions',
    description: 'UPS systems, generators, and power backup solutions',
    image: '/placeholder.svg',
    link: '/shop?category=power',
    bgColor: 'bg-purple-500'
  }
];

const CategoriesNavigation = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  const nextCategory = () => {
    setActiveCategory((prev) => (prev + 1) % categories.length);
  };

  const prevCategory = () => {
    setActiveCategory((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const currentCategory = categories[activeCategory];

  return (
    <section className="bg-background py-8 border-b">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Explore Our Categories</h2>
          <p className="text-muted-foreground">Discover our comprehensive range of ICT equipment and electrical materials</p>
        </div>

        <div className="relative">
          {/* Main Category Display */}
          <div className={`${currentCategory.bgColor} rounded-lg p-8 text-white relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-3">{currentCategory.title}</h3>
                <p className="text-white/90 mb-6 max-w-md">{currentCategory.description}</p>
                <Link to={currentCategory.link}>
                  <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    Shop Now
                  </Button>
                </Link>
              </div>
              
              <div className="flex-shrink-0 ml-8">
                <img 
                  src={currentCategory.image} 
                  alt={currentCategory.title}
                  className="w-48 h-32 object-cover rounded-lg opacity-90"
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="sm"
              onClick={prevCategory}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white hover:bg-white/30 rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextCategory}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white hover:bg-white/30 rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === activeCategory 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to category ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Quick Category Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.link}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                index === activeCategory 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-center">
                <h4 className="font-semibold text-sm text-foreground mb-1">{category.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesNavigation;