import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Search as SearchIcon, User, List, Heart, LogOut, ChevronDown, Shield, Package, FileText, Bell } from 'lucide-react';
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
import { branding, isImageLogo } from '@/config/branding';
import { useSettings } from '@/context/SettingsContext';




const UserDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadQuotes, setUnreadQuotes] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadQuotes = async () => {
      try {
        const res = await fetch('/api/quotes/user', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) {
          const quotes = await res.json();
          // Count quotes with status 'responded' that user hasn't seen
          const unread = quotes.filter((q: any) => q.status === 'responded' && !q.userSeen).length;
          setUnreadQuotes(unread);
        }
      } catch (err) {
        console.error('Failed to fetch unread quotes:', err);
      }
    };

    fetchUnreadQuotes();
    // Refresh less frequently - every 2 minutes to avoid rate limiting
    const interval = setInterval(fetchUnreadQuotes, 120000);
    return () => clearInterval(interval);
  }, [user]);

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
        <DropdownMenuItem asChild>
          <Link to="/my-quotes" className="flex items-center gap-2 relative">
            <FileText className="w-4 h-4" /> My Quotes
            {unreadQuotes > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadQuotes}
              </span>
            )}
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
        {/* Warehouse Panel link for warehouse staff and superadmin */}
        {(user.role === 'warehouse' || user.role === 'superadmin') && (
          <DropdownMenuItem asChild>
            <Link to="/warehouse" className="flex items-center gap-2 text-green-600 font-semibold">
              <Package className="w-4 h-4" /> Warehouse Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout();
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
      <div className="flex items-center gap-2">
        <Link to="/login">
          <Button variant="outline" size="sm">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="default" size="sm">Register</Button>
        </Link>
      </div>
    );
  }
  return <UserDropdown />;
};

// Auth actions shown inside the mobile menu (top bar hides UserMenu below
// the `md` breakpoint — there isn't room for it alongside the logo and cart).
const MobileAuthLinks: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex gap-3">
        <Link to="/login" onClick={onNavigate} className="flex-1">
          <Button variant="outline" className="w-full">Login</Button>
        </Link>
        <Link to="/register" onClick={onNavigate} className="flex-1">
          <Button className="w-full">Register</Button>
        </Link>
      </div>
    );
  }

  const firstName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
  return (
    <div className="space-y-3 border-t pt-4">
      <p className="text-sm text-muted-foreground">Hi, {firstName}</p>
      <Link to="/account" className="flex items-center gap-2 text-foreground" onClick={onNavigate}>
        <User className="w-4 h-4" /> My Account
      </Link>
      <Link to="/orders" className="flex items-center gap-2 text-foreground" onClick={onNavigate}>
        <List className="w-4 h-4" /> Orders
      </Link>
      <Link to="/wishlist" className="flex items-center gap-2 text-foreground" onClick={onNavigate}>
        <Heart className="w-4 h-4" /> Wishlist
      </Link>
      <Link to="/my-quotes" className="flex items-center gap-2 text-foreground" onClick={onNavigate}>
        <FileText className="w-4 h-4" /> My Quotes
      </Link>
      {(user.role === 'admin' || user.role === 'superadmin') && (
        <Link to="/admin" className="flex items-center gap-2 text-blue-600 font-semibold" onClick={onNavigate}>
          <Shield className="w-4 h-4" /> Admin Panel
        </Link>
      )}
      {(user.role === 'warehouse' || user.role === 'superadmin') && (
        <Link to="/warehouse" className="flex items-center gap-2 text-green-600 font-semibold" onClick={onNavigate}>
          <Package className="w-4 h-4" /> Warehouse Panel
        </Link>
      )}
      <button
        onClick={() => { logout(); onNavigate(); }}
        className="flex items-center gap-2 text-red-600"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
};



// import { searchProducts } from '@/data/products';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{id: string, name: string}[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // For keyboard navigation
  const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();

  // Merge settings with fallback branding
  const logoType = settings?.logoType || branding.logo.type;
  const logoSrc = settings?.logoImageSrc || branding.logo.image.src;
  const logoIconSrc = settings?.logoIconSrc || branding.logo.image.iconSrc;
  const companyName = settings?.companyName || branding.company.name;
  const companyTagline = settings?.companyTagline || branding.company.tagline;
  const initials = settings?.logoTextInitials || branding.logo.text.initials;



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSuggestions([]);
      setTimeout(() => setLoading(false), 600); // Simulate loading
    }
  };

  // Clean up debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      const selected = suggestions[highlightedIndex];
      setSearchQuery('');
      setSuggestions([]);
      setSearchError(null);
      setHighlightedIndex(-1);
      navigate(`/product/${selected.id}`);
    }
  };

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  const distinctProducts = cartItems.length;
  const isHomePage = location.pathname === '/';

  // 1. Use the same endpoint for both desktop and mobile
  const SEARCH_API = '/api/products/search?q=';

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-2 py-3 sm:py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
              {logoType === 'image' ? (
                // Full image lockup (via admin settings override)
                <img
                  src={logoSrc}
                  alt={branding.logo.image.alt}
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              ) : (
                // Default: brand mark + text wordmark
                <>
                  <img
                    src={logoIconSrc}
                    alt={branding.logo.image.alt}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-primary leading-none tracking-tight truncate">{companyName}</h1>
                    <p className="hidden xs:block text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mt-0.5">{companyTagline}</p>
                  </div>
                </>
              )}
            </Link>

            {/* Search Bar (Desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8" role="search" autoComplete="off">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  aria-label="Search for products"
                  placeholder="Search for ICT equipment, electrical materials..."
                  value={searchQuery}
                  onChange={async (e) => {
                    setSearchQuery(e.target.value);
                    setSearchError(null);
                    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
                    debounceTimeout.current = setTimeout(async () => {
                      if (e.target.value.trim().length > 1) {
                        setLoading(true); // Show loading
                        try {
                          const res = await fetch(`${SEARCH_API}${encodeURIComponent(e.target.value.trim())}`);
                          if (res.ok) {
                            const data = await res.json();
                            setSuggestions(data.map((p: any) => ({ id: p.id, name: p.name })));
                            setSearchError(data.length === 0 ? 'No products found.' : null);
                          } else {
                            setSuggestions([]);
                            setSearchError('No products found or server error.');
                          }
                        } catch (err) {
                          setSuggestions([]);
                          setSearchError('Network error or server unavailable.');
                        }
                        setLoading(false); // Hide loading
                      } else {
                        setSuggestions([]);
                        setSearchError(null);
                      }
                    }, 350);
                  }}
                  className="pl-10 pr-10 py-2 w-full border-2 focus:border-primary"
                  onKeyDown={handleKeyDown}
                />
                {/* Clear button */}
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20"><path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                )}
                <Button
                  type="submit"
                  aria-label="Search"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-accent hover:bg-accent/90"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center"><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>Searching...</span>
                  ) : 'Search'}
                </Button>
                {/* Suggestions dropdown */}
                {(suggestions.length > 0 || searchError) && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white border rounded shadow z-10">
                    {loading && (
                      <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
                        Loading...
                      </div>
                    )}
                    {searchError && !loading && (
                      <div className="px-4 py-2 text-sm text-red-500">
                        {searchError}
                      </div>
                    )}
                    {suggestions.map((s, i) => (
                      <div
                        key={s.id}
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${highlightedIndex === i ? 'bg-gray-100' : ''}`}
                        onClick={() => {
                          setSearchQuery('');
                          setSuggestions([]);
                          setSearchError(null);
                          setHighlightedIndex(-1);
                          navigate(`/product/${s.id}`);
                        }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                      >
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* User Menu — hidden on mobile; Login/Register/account links move
                into the hamburger menu below, where there's room for them. */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="hidden md:flex">
                <UserMenu />
              </div>
              {/* Cart */}
              {user && (
                <Link to="/cart" className="relative">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">Cart</span>
                  </Button>
                  {distinctProducts > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {distinctProducts}
                    </span>
                  )}
                </Link>
              )}
              {/* Mobile menu toggle — moved up from the nav row so it sits
                  next to the cart instead of on its own line. */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                className="md:hidden flex flex-col justify-center gap-1 w-8 h-8 shrink-0"
              >
                <div className="w-6 h-0.5 bg-foreground"></div>
                <div className="w-6 h-0.5 bg-foreground"></div>
                <div className="w-6 h-0.5 bg-foreground"></div>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="border-t py-4">
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

            {/* Mobile menu */}
            {isMenuOpen && (
              <div className="md:hidden mt-4 py-4 border-t">
                <div className="flex flex-col space-y-4">
                  <form onSubmit={handleSearch} className="flex mb-4 relative" role="search" autoComplete="off">
                    <Input
                      type="text"
                      aria-label="Search for products"
                      placeholder="Search for ICT equipment, electrical materials..."
                      value={searchQuery}
                      onChange={async (e) => {
                        setSearchQuery(e.target.value);
                        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
                        debounceTimeout.current = setTimeout(async () => {
                          if (e.target.value.trim().length > 1) {
                            try {
                              const res = await fetch(`${SEARCH_API}${encodeURIComponent(e.target.value.trim())}`);
                              if (res.ok) {
                                const data = await res.json();
                                setSuggestions(data.map((p: any) => ({ id: p.id, name: p.name })));
                              } else {
                                setSuggestions([]);
                              }
                            } catch {
                              setSuggestions([]);
                            }
                          } else {
                            setSuggestions([]);
                          }
                        }, 350);
                      }}
                      className="flex-1 mr-2 pr-10"
                      onKeyDown={handleKeyDown}
                    />
                    {/* Clear button */}
                    {searchQuery && (
                      <button
                        type="button"
                        aria-label="Clear search"
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20"><path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                    )}
                    <Button type="submit" aria-label="Search" size="sm" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center"><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>Searching...</span>
                      ) : 'Search'}
                    </Button>
                    {/* Suggestions dropdown */}
                    {(suggestions.length > 0 || searchError) && (
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border rounded shadow z-10">
                        {loading && (
                          <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
                            Loading...
                          </div>
                        )}
                        {searchError && !loading && (
                          <div className="px-4 py-2 text-sm text-red-500">
                            {searchError}
                          </div>
                        )}
                        {suggestions.map((s, i) => (
                          <div
                            key={s.id}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${highlightedIndex === i ? 'bg-gray-100' : ''}`}
                            onClick={() => {
                              setSearchQuery('');
                              setSuggestions([]);
                              setHighlightedIndex(-1);
                              navigate(`/product/${s.id}`);
                            }}
                            onMouseEnter={() => setHighlightedIndex(i)}
                          >
                            {s.name}
                          </div>
                        ))}
                      </div>
                    )}
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
                  <MobileAuthLinks onNavigate={() => setIsMenuOpen(false)} />
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
