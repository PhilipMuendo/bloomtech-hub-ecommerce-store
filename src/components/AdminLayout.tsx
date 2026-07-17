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

  Menu,
  Bell,
  Activity,
  CreditCard,
  Globe,
  MessageCircle,
  Building2,
  FileText,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import ReactDOM from 'react-dom';
import { branding } from '@/config/branding';

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
  const [newOrders, setNewOrders] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'stock' | 'orders'>('stock');
  const [adminQuoteNotifications, setAdminQuoteNotifications] = useState(0);
  const [contactMessageNotifications, setContactMessageNotifications] = useState(0);

  useEffect(() => {
    async function fetchLowStock() {
      const data = await fetchLowStockProducts(user?.token);
      setLowStockProducts(data);
    }
    
    async function fetchNewOrders() {
      if (!user?.token || (user.role !== 'admin' && user.role !== 'superadmin')) return;
      try {
        const res = await fetch('/api/orders/recent/notifications', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch new orders');
        const data = await res.json();
        setNewOrders(data);
      } catch (error) {
        console.error("Failed to fetch new order notifications:", error);
        setNewOrders([]);
      }
    }
    
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchLowStock();
      fetchNewOrders();
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
      if (user?.role !== 'admin' && user?.role !== 'superadmin') return;
      try {
        const res = await fetch('/api/quotes', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) {
          console.error("Failed to fetch quotes:", res.status, res.statusText);
          return;
        }
        const data = await res.json();
        // Handle both array and object responses
        const quotes = Array.isArray(data) ? data : (data.quotes || []);
        const unseen = quotes.filter((q: any) => !q.adminSeen).length;
        setAdminQuoteNotifications(unseen);
      } catch (error) {
        console.error("Failed to fetch admin notifications:", error);
      }
    };
    fetchAdminQuoteNotifications();
    
    const fetchContactMessageNotifications = async () => {
      if (user?.role !== 'admin' && user?.role !== 'superadmin') return;
      try {
        const res = await fetch('/api/contact/messages?status=new', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) {
          console.error("Failed to fetch contact messages:", res.status, res.statusText);
          return;
        }
        const data = await res.json();
        const newMessages = data.messages?.filter((m: any) => m.status === 'new') || [];
        setContactMessageNotifications(newMessages.length);
      } catch (error) {
        console.error("Failed to fetch contact message notifications:", error);
      }
    };
    fetchContactMessageNotifications();
  }, [user]);

  const menuGroups = [
    {
      section: 'Overview',
      items: [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      ],
    },
    {
      section: 'Catalog',
      items: [
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/subcategories', icon: Package, label: 'Subcategories' },
        { path: '/admin/low-stock', icon: AlertTriangle, label: 'Low Stock' },
      ],
    },
    {
      section: 'Sales',
      items: [
        { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/admin/bank-transfer-orders', icon: Building2, label: 'Bank Transfer Orders' },
        { path: '/admin/quotes', icon: Bell, label: 'Quotes' },
      ],
    },
    {
      section: 'Content',
      items: [
        { path: '/admin/blog', icon: FileText, label: 'Blog' },
      ],
    },
    {
      section: 'People',
      items: [
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
        { path: '/admin/contact-messages', icon: MessageCircle, label: 'Contact Messages' },
        { path: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
      ],
    },
    {
      section: 'System',
      items: [
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
        // Superadmin only
        ...(user?.role === 'superadmin' ? [
          { path: '/admin/pesapal-transactions', icon: CreditCard, label: 'Transactions' },
          { path: '/admin/audit-logs', icon: Activity, label: 'Audit Logs' },
        ] : []),
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuotesClick = async () => {
    // Mark quotes as seen by admin when they visit the quotes page
    if (adminQuoteNotifications > 0) {
      try {
        await fetch('/api/quotes/mark-admin-seen', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });
        // Reset the notification count
        setAdminQuoteNotifications(0);
      } catch (error) {
        console.error('Error marking quotes as seen:', error);
      }
    }
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
              <img src="/logo-icon.png" alt="Bloom Tech Hub" className="w-8 h-8 object-contain" />
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">{branding.company.fullName}</p>
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

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {menuGroups.map((group, groupIndex) => (
                <div key={group.section} className={groupIndex > 0 ? 'pt-4' : ''}>
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                    {group.section}
                  </p>
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                      onClick={item.path === '/admin/quotes' ? handleQuotesClick : undefined}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.label}</span>
                      {item.path === '/admin/quotes' && adminQuoteNotifications > 0 && (
                        <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                          {adminQuoteNotifications}
                        </span>
                      )}
                      {item.path === '/admin/contact-messages' && contactMessageNotifications > 0 && (
                        <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                          {contactMessageNotifications}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
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
                {menuGroups.flatMap((g) => g.items).find((item) => isActive(item.path))?.label || 'Admin'}
                </h1>
            </div>
            <div className="flex items-center gap-4">
              {(lowStockProducts.length > 0 || newOrders.length > 0) && (
                <button
                  className="relative focus:outline-none"
                  onClick={() => setShowNotif((v) => !v)}
                  aria-label="Admin notifications"
                >
                  <Bell className="h-6 w-6 text-gray-600" />
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {lowStockProducts.length + newOrders.length}
                  </span>
                </button>
              )}
              {/* User Profile and other header items can go here */}
              {showNotif && typeof window !== 'undefined' && ReactDOM.createPortal(
                <div className="fixed top-20 right-8 w-80 bg-white border rounded-xl shadow-2xl z-[9999] overflow-hidden animate-fade-in">
                  {/* Notification Tabs */}
                  <div className="flex border-b bg-gray-50">
                    <button
                      className={`flex-1 p-3 text-sm font-medium transition-colors ${
                        notificationTab === 'stock'
                          ? 'bg-white border-b-2 border-primary text-primary'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => setNotificationTab('stock')}
                    >
                      Low Stock ({lowStockProducts.length})
                    </button>
                    <button
                      className={`flex-1 p-3 text-sm font-medium transition-colors ${
                        notificationTab === 'orders'
                          ? 'bg-white border-b-2 border-primary text-primary'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => setNotificationTab('orders')}
                    >
                      New Orders ({newOrders.length})
                    </button>
                  </div>
                  
                  {/* Stock Notifications */}
                  {notificationTab === 'stock' && (
                    <>
                      {lowStockProducts.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">No low stock products.</div>
                      ) : (
                        <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                          {lowStockProducts.map((p) => (
                            <li key={p.id} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setShowNotif(false); navigate(`/admin/products?edit=${p.id}`); }}>
                              <span className="truncate max-w-[160px] font-medium text-gray-800">{p.name}</span>
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
                    </>
                  )}
                  
                  {/* Order Notifications */}
                  {notificationTab === 'orders' && (
                    <>
                      {newOrders.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">No new orders.</div>
                      ) : (
                        <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                          {newOrders.map((order) => (
                            <li key={order.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 text-sm">{order.customerName}</p>
                                  <p className="text-xs text-gray-600">{order.customerEmail}</p>
                                  <p className="text-xs text-green-600 font-medium">KES {order.total.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    order.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                                             <div className="p-2 border-t bg-gray-50 text-center">
                         <button
                           className="text-primary font-semibold hover:underline text-sm"
                           onClick={async () => { 
                             // Mark all current orders as viewed
                             if (newOrders.length > 0) {
                               try {
                                 const orderIds = newOrders.map(order => order.id);
                                 await fetch('/api/orders/mark-viewed', {
                                   method: 'PATCH',
                                   headers: {
                                     'Content-Type': 'application/json',
                                     Authorization: `Bearer ${user.token}`,
                                   },
                                   body: JSON.stringify({ orderIds })
                                 });
                                 // Clear the new orders list
                                 setNewOrders([]);
                               } catch (error) {
                                 console.error('Error marking orders as viewed:', error);
                               }
                             }
                             setShowNotif(false); 
                             navigate('/admin/orders'); 
                           }}
                         >
                           View All Orders
                         </button>
                       </div>
                    </>
                  )}
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