import React, { useState } from 'react';
import { Search, ShoppingCart, Search as SearchIcon, User, List, Heart, LogOut, ChevronDown, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  if (!user) return null;
  const firstName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3">
          <User className="w-4 h-4" />
          <span>Hi, {firstName}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/account" className="flex items-center gap-2">
            <User className="w-4 h-4" /> My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/orders" className="flex items-center gap-2">
            <List className="w-4 h-4" /> Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wishlist" className="flex items-center gap-2">
            <Heart className="w-4 h-4" /> Wishlist
          </Link>
        </DropdownMenuItem>
        {/* Admin Panel link for admin/superadmin */}
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center gap-2 text-blue-600 font-semibold">
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout();
            toast({ title: 'You have successfully logged out.' });
            navigate('/');
          }}
          className="text-red-600 cursor-pointer flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserMenu = () => {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="flex items-center gap-4 ml-auto">
        <Link to="/login">
          <Button variant="outline" className="mx-1">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="default" className="mx-1">Register</Button>
        </Link>
      </div>
    );
  }
  return <UserDropdown />;
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isHomePage = location.pathname === '/';

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"
              initial={isHomePage ? { scale: 0 } : { scale: 1 }}
              animate={isHomePage ? { scale: 1 } : { scale: 1 }}
              transition={isHomePage ? { 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                duration: 0.8 
              } : { duration: 0 }}
            >
              <span className="text-white font-bold text-lg">BT</span>
            </motion.div>
            <motion.div
              initial={isHomePage ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
              animate={isHomePage ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
              transition={isHomePage ? { 
                delay: 0.3, 
                duration: 0.6,
                ease: "easeOut"
              } : { duration: 0 }}
            >
              <h1 className="text-2xl font-bold text-primary">BLOOMTECH</h1>
              <p className="text-sm text-accent -mt-1">Hub</p>
            </motion.div>
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

          {/* User Menu */}
          <UserMenu />

          {/* Cart */}
          {user && (
            <Link to="/cart" className="relative">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
              </Button>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="border-t py-4">
          <div className="flex items-center justify-between">
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="story-link text-foreground hover:text-primary font-medium transition-colors duration-300">
                Home
              </Link>
              <Link to="/shop" className="story-link text-foreground hover:text-primary font-medium transition-colors duration-300">
                Shop
              </Link>
              <Link to="/blog" className="story-link text-foreground hover:text-primary font-medium transition-colors duration-300">
                Blog
              </Link>
              <Link to="/about" className="story-link text-foreground hover:text-primary font-medium transition-colors duration-300">
                About Us
              </Link>
              <Link to="/contact" className="story-link text-foreground hover:text-primary font-medium transition-colors duration-300">
                Contact
              </Link>
              <Link to="/faqs" className="story-link text-foreground hover:text-primary font-medium transition-colors duration-300">
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
                <Link to="/blog" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Blog
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
