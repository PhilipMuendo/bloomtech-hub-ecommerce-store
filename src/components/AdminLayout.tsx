import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  Mail,
  LogOut,
  ArrowLeft,
  BookOpen,
  Menu,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import ReactDOM from 'react-dom';

export async function fetchLowStockProducts(token) {
  try {
    const res = await fetch('/api/products/low-stock', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch {
    return [];
  }
}

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [adminQuoteNotifications, setAdminQuoteNotifications] = useState(0);

  useEffect(() => {
    async function fetchLowStock() {
      const data = await fetchLowStockProducts(user?.token);
      setLowStockProducts(data);
    }
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchLowStock();
    }
    // Listen for lowStockUpdated event
    function handleLowStockUpdated(e) {
      setLowStockProducts(e.detail);
    }
    window.addEventListener('lowStockUpdated', handleLowStockUpdated);
    return () => {
      window.removeEventListener('lowStockUpdated', handleLowStockUpdated);
    };
  }, [user]);

  useEffect(() => {
    const fetchAdminQuoteNotifications = async () => {
      if (user?.role !== 'superadmin') return;
      try {
        const res = await fetch('/api/quotes', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        const unseen = data.filter((q: any) => !q.adminSeen).length;
        setAdminQuoteNotifications(unseen);
      } catch (error) {
        console.error("Failed to fetch admin notifications:", error);
      }
    };
    fetchAdminQuoteNotifications();
  }, [user]);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/quotes', icon: Bell, label: 'Quotes' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
    { path: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
    { path: '/admin/blogs', icon: BookOpen, label: 'Blogs' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar (collapsible on mobile) */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`fixed z-50 top-0 left-0 h-full w-64 bg-card border-r transform transition-transform duration-200 md:static md:translate-x-0 md:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">BLOOMTECH Hub</p>
              </div>
            </div>
            {/* User info with badge */}
            {user && (
              <div className="flex items-center gap-2 mb-6">
                <span className="font-semibold text-base truncate max-w-[100px]">{user.name}</span>
                {user.role === 'superadmin' ? (
                  <Badge className="bg-yellow-400 text-yellow-900">Super Admin</Badge>
                ) : user.role === 'admin' ? (
                  <Badge className="bg-blue-500 text-white">Admin</Badge>
                ) : null}
              </div>
            )}

            <nav className="mt-4 flex-1 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                  {item.path === '/admin/quotes' && adminQuoteNotifications > 0 && (
                    <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                      {adminQuoteNotifications}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="mt-8 pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  navigate('/');
                  setSidebarOpen(false);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Store
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen md:ml-0">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu />
              </Button>
              <h1 className="text-xl font-semibold">
                {menuItems.find((item) => isActive(item.path))?.label || 'Admin'}
                </h1>
            </div>
            <div className="flex items-center gap-4">
              {lowStockProducts.length > 0 && (
                  <button
                    className="relative focus:outline-none"
                    onClick={() => setShowNotif((v) => !v)}
                    aria-label="Low stock notifications"
                  >
                    <Bell className="h-6 w-6 text-gray-600" />
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                        {lowStockProducts.length}
                      </span>
                </button>
                    )}
              {/* User Profile and other header items can go here */}
                  {showNotif && typeof window !== 'undefined' && ReactDOM.createPortal(
                    <div className="fixed top-20 right-8 w-72 bg-white border rounded-xl shadow-2xl z-[9999] overflow-hidden animate-fade-in">
                      <div className="p-4 font-semibold border-b bg-gray-50 rounded-t-xl">Low Stock Products</div>
                      {lowStockProducts.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">No low stock products.</div>
                      ) : (
                        <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                          {lowStockProducts.map((p) => (
                            <li key={p._id} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                              <span className="truncate max-w-[140px] font-medium text-gray-800">{p.name}</span>
                              <span className="text-red-600 font-bold">{p.stock}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="p-2 border-t bg-gray-50 text-center">
                        <button
                          className="text-primary font-semibold hover:underline text-sm"
                          onClick={() => { setShowNotif(false); navigate('/admin/low-stock'); }}
                        >
                          View Low Stock Products
                        </button>
                      </div>
                    </div>,
                    document.body
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-2 sm:p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;