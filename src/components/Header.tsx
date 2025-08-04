import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Search as SearchIcon, User, List, Heart, LogOut, ChevronDown, Shield, Bell, MailCheck, RefreshCw, Package } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
            toast({ title: 'You have successfully logged out.' });
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

const NotificationDropdown = ({ totalNotifications, quoteNotifications, orderNotifications }: {
  totalNotifications: number;
  quoteNotifications: number;
  orderNotifications: number;
}) => {
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [quoteDetails, setQuoteDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!user) return null;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', user.id, user.role] });
  };

  const fetchNotificationDetails = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch order details for regular users
      if (user.role !== 'admin' && user.role !== 'superadmin' && orderNotifications > 0) {
        const orderRes = await fetch('/api/orders/user/notifications', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrderDetails(orderData);
        }
      }
      
      // Fetch quote details
      if (quoteNotifications > 0) {
        const quoteRes = await fetch('/api/quotes/user', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (quoteRes.ok) {
          const quoteData = await quoteRes.json();
          const quotes = Array.isArray(quoteData) ? quoteData : (quoteData.quotes || []);
          const unviewedQuotes = quotes.filter((q: any) => q.status === 'responded' && q.userSeen === false);
          setQuoteDetails(unviewedQuotes);
        }
      }
    } catch (error) {
      console.error('Error fetching notification details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notification details when component mounts or notifications change
  useEffect(() => {
    if (totalNotifications > 0) {
      fetchNotificationDetails();
    }
  }, [totalNotifications, quoteNotifications, orderNotifications]);

  const handleNotificationClick = async (type: 'quotes' | 'orders') => {
    try {
      // Mark notifications as seen
      if (type === 'quotes' && quoteNotifications > 0) {
        const endpoint = (user.role === 'admin' || user.role === 'superadmin') 
          ? '/api/quotes/mark-admin-seen' 
          : '/api/quotes/mark-seen';
        
        await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });
      }
      
      // Mark orders as viewed for regular users
      if (type === 'orders' && orderNotifications > 0 && (user.role !== 'admin' && user.role !== 'superadmin')) {
        // Get the current unviewed orders and mark them as viewed
        const orderRes = await fetch('/api/orders/user/notifications', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          if (orderData.length > 0) {
            const orderIds = orderData.map((order: any) => order.id);
            await fetch('/api/orders/user/mark-viewed', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({ orderIds })
            });
          }
        }
      }
      
      // Invalidate queries to refresh notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id, user.role] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      // Navigate to the appropriate page
      navigate(type === 'quotes' ? '/my-quotes' : '/orders');
    } catch (error) {
      console.error('Error marking notifications as seen:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="w-6 h-6 text-accent" />
          {totalNotifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 min-w-[18px] flex items-center justify-center">
              {totalNotifications}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {totalNotifications === 0 ? (
            <p className="text-muted-foreground text-sm">No new notifications</p>
          ) : (
            <div className="space-y-3">
              {quoteNotifications > 0 && (
                <div 
                  className="flex items-center justify-between p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleNotificationClick('quotes')}
                >
                  <div className="flex items-center gap-2">
                    <MailCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Quote Updates</span>
                  </div>
                  <Badge variant="secondary">{quoteNotifications}</Badge>
                </div>
              )}
              
              {orderNotifications > 0 && (
                <div 
                  className="flex items-center justify-between p-2 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => handleNotificationClick('orders')}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">
                      {user.role === 'admin' || user.role === 'superadmin' 
                        ? 'Recent Orders' 
                        : 'Order Updates'
                      }
                    </span>
                  </div>
                  <Badge variant="secondary">{orderNotifications}</Badge>
                </div>
              )}
              
              {/* Detailed notifications for regular users */}
              {user.role !== 'admin' && user.role !== 'superadmin' && (
                <>
                  {quoteDetails.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-xs font-medium text-gray-600 mb-2">Quote Details:</h4>
                      <div className="space-y-2">
                        {quoteDetails.slice(0, 3).map((quote: any) => (
                          <div key={quote.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <div className="font-medium">Quote #{quote.id}</div>
                            <div className="text-gray-500">Status: {quote.status}</div>
                            <div className="text-gray-500">
                              {new Date(quote.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                        {quoteDetails.length > 3 && (
                          <div className="text-xs text-blue-600 text-center">
                            +{quoteDetails.length - 3} more quotes
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {orderDetails.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-xs font-medium text-gray-600 mb-2">Order Details:</h4>
                      <div className="space-y-2">
                        {orderDetails.slice(0, 3).map((order: any) => (
                          <div key={order.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <div className="font-medium">Order #{order.trackingNumber}</div>
                            <div className="text-gray-500">Status: {order.status}</div>
                            <div className="text-gray-500">KES {order.total.toLocaleString()}</div>
                            <div className="text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                        {orderDetails.length > 3 && (
                          <div className="text-xs text-blue-600 text-center">
                            +{orderDetails.length - 3} more orders
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleNotificationClick('quotes')}
              >
                View Quotes
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleNotificationClick('orders')}
              >
                View Orders
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const { toast } = useToast();
  // Add state for notifications
  const [quoteNotifications, setQuoteNotifications] = useState(0);
  const [orderNotifications, setOrderNotifications] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);

  // Fetch notifications with React Query for real-time updates
  const fetchNotifications = async () => {
    if (!user) return { quotes: 0, orders: 0, total: 0 };

    try {
      let quoteCount = 0;
      let orderCount = 0;

      // Fetch quote notifications
      const quoteRes = await fetch('/api/quotes/user', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json();
        const quotes = Array.isArray(quoteData) ? quoteData : (quoteData.quotes || []);
        quoteCount = quotes.filter((q: any) => q.status === 'responded' && q.userSeen === false).length;
      }

      // Different notification logic for admins vs users
      if (user.role === 'admin' || user.role === 'superadmin') {
        // Admin notifications: Track recent order activity and status changes
        const adminOrderRes = await fetch('/api/orders/recent/notifications', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        if (adminOrderRes.ok) {
          const adminOrderData = await adminOrderRes.json();
          // Count orders that need attention (pending, processing)
          orderCount = adminOrderData.length;
        }
      } else {
        // User notifications: Get unviewed orders
        const orderRes = await fetch('/api/orders/user/notifications', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          orderCount = orderData.length;
        }
      }

      return { quotes: quoteCount, orders: orderCount, total: quoteCount + orderCount };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { quotes: 0, orders: 0, total: 0 };
    }
  };

  const { data: notificationData } = useQuery({
    queryKey: ['notifications', user?.id, user?.role],
    queryFn: fetchNotifications,
    enabled: !!user,
    refetchInterval: 15000, // Refetch every 15 seconds
    refetchIntervalInBackground: true,
  });

  // Update notification counts when data changes
  useEffect(() => {
    if (notificationData) {
      const oldTotal = totalNotifications;
      const newTotal = notificationData.total;
      
      setQuoteNotifications(notificationData.quotes);
      setOrderNotifications(notificationData.orders);
      setTotalNotifications(newTotal);
      
      // Show toast when new notifications arrive
      if (newTotal > oldTotal && oldTotal > 0) {
        toast({
          title: "New notifications",
          description: `You have ${newTotal - oldTotal} new notification${newTotal - oldTotal > 1 ? 's' : ''}`,
          duration: 3000,
        });
      }
    }
  }, [notificationData, totalNotifications, toast]);

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

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <NotificationDropdown totalNotifications={totalNotifications} quoteNotifications={quoteNotifications} orderNotifications={orderNotifications} />
            )}
          <UserMenu />
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
          </div>
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
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
