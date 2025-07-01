
import React, { useState } from 'react';
import { Search, Cart, Search as SearchIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">BT</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">BLOOMTECH</h1>
              <p className="text-sm text-accent -mt-1">Hub</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for ICT equipment, electrical materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-2 focus:border-primary"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-accent hover:bg-accent/90">
                Search
              </Button>
            </div>
          </form>

          {/* Cart */}
          <Link to="/cart" className="relative">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Cart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
            </Button>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="border-t py-4">
          <div className="flex items-center justify-between">
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-foreground hover:text-primary font-medium transition-colors">
                Home
              </Link>
              <Link to="/shop" className="text-foreground hover:text-primary font-medium transition-colors">
                Shop
              </Link>
              <Link to="/shop?category=ict" className="text-foreground hover:text-primary font-medium transition-colors">
                ICT Equipment
              </Link>
              <Link to="/shop?category=electrical" className="text-foreground hover:text-primary font-medium transition-colors">
                Electrical Materials
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary font-medium transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-foreground hover:text-primary font-medium transition-colors">
                Contact
              </Link>
              <Link to="/faqs" className="text-foreground hover:text-primary font-medium transition-colors">
                FAQs
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex flex-col space-y-1"
            >
              <div className="w-6 h-0.5 bg-foreground"></div>
              <div className="w-6 h-0.5 bg-foreground"></div>
              <div className="w-6 h-0.5 bg-foreground"></div>
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t">
              <div className="flex flex-col space-y-4">
                <form onSubmit={handleSearch} className="flex mb-4">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 mr-2"
                  />
                  <Button type="submit" size="sm">Search</Button>
                </form>
                <Link to="/" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/shop" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Shop
                </Link>
                <Link to="/shop?category=ict" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  ICT Equipment
                </Link>
                <Link to="/shop?category=electrical" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Electrical Materials
                </Link>
                <Link to="/about" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  About Us
                </Link>
                <Link to="/contact" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </Link>
                <Link to="/faqs" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  FAQs
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
