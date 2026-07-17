import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAutoRefreshList, REAL_TIME_EVENTS } from '@/utils/realTimeUpdates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Truck, Package, Loader, CheckCircle, XCircle, MapPin, Hash, Check } from 'lucide-react';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  shippingAddress?: string;
  trackingNumber?: string;
}

const statusColors: Record<string, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'outline',
  delivered: 'default',
  cancelled: 'destructive',
};

// Order status steps for progress bar
const statusSteps = [
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Loader className="w-5 h-5 text-yellow-500 animate-spin" />,
  processing: <Package className="w-5 h-5 text-blue-500" />,
  shipped: <Truck className="w-5 h-5 text-indigo-500" />,
  delivered: <CheckCircle className="w-5 h-5 text-green-600" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = user?.token || (typeof window !== 'undefined' && localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).token);
      const params = new URLSearchParams();
      if (user?.id) params.set('userId', String(user.id));
      const res = await fetch(`/api/orders?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      const normalized = data.orders.map((o: any) => ({
        id: o.id,
        date: o.createdAt,
        status: o.status,
        total: o.total,
        items: o.items?.map((item: any) => ({
          productName: item.productName || item.productId || 'N/A',
          quantity: item.quantity,
          price: item.price,
        })) || [],
        shippingAddress: o.shippingAddress || 'N/A',
        trackingNumber: o.trackingNumber || 'N/A',
      }));
      setOrders(normalized);
    } catch (err: any) {
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh orders list when order status changes
  useAutoRefreshList(
    fetchOrders,
    [REAL_TIME_EVENTS.ORDER_STATUS_CHANGED],
    [user]
  );

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date).setHours(0,0,0,0);
    const from = dateFrom ? new Date(dateFrom).setHours(0,0,0,0) : null;
    const to = dateTo ? new Date(dateTo).setHours(0,0,0,0) : null;
    if (from && orderDate < from) return false;
    if (to && orderDate > to) return false;
    return true;
  });

  if (loading) {
    return <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-16 text-center">Loading your orders...</div>;
  }
  if (error) {
    return <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-16 text-center text-red-500">{error}</div>;
  }
  if (!orders.length) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-16 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Your Orders</h1>
        <p className="text-muted-foreground text-base sm:text-lg">You have not placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Your Orders</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="dateFrom" className="text-sm font-medium">From:</label>
          <input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dateTo" className="text-sm font-medium">To:</label>
          <input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button variant="outline" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</Button>
        )}
      </div>
      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className="transition-all duration-200 hover:shadow-lg hover:scale-[1.01] border border-gray-200"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span>{statusIcons[order.status]}</span>
                <div>
                  <CardTitle className="text-lg">Order #{order.id?.toString().slice(-6)}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Date: {new Date(order.date).toLocaleDateString()}</CardDescription>
                </div>
              </div>
              <Badge variant={statusColors[order.status] || 'secondary'} className="text-xs px-3 py-1">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-3">
              <div className="text-lg font-semibold text-primary">Total: KES {order.total.toLocaleString()}</div>
              <Button variant="outline" onClick={() => setSelectedOrder(order)} className="text-sm px-4 py-2">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Order Details - {selectedOrder.id?.toString().slice(-6)}
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  (Full ID: <span id="fullOrderId" className="font-mono">{selectedOrder.id}</span>)
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrder.id);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1000);
                    }}
                    title={copied ? "Copied!" : "Copy Order ID"}
                    className={`ml-1 px-1 py-0.5 rounded text-xs font-semibold transition-all duration-200
                      ${copied ? 'bg-green-400 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    {copied ? <span className="flex items-center gap-1"><Check className="w-3 h-3" />Copied!</span> : 'Copy'}
                  </button>
                </span>
              </DialogTitle>
              <DialogDescription>
                Placed on {new Date(selectedOrder.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  {statusSteps.slice(0, selectedOrder.status === 'cancelled' ? 5 : 4).map((step, idx) => {
                    const isActive = step.key === selectedOrder.status;
                    const isCompleted = statusSteps.findIndex(s => s.key === selectedOrder.status) > idx;
                    return (
                      <div key={step.key} className="flex-1 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2
                          ${isCompleted ? 'bg-green-500 border-green-600 text-white' : isActive ? (step.key === 'cancelled' ? 'bg-red-500 border-red-600 text-white' : 'bg-blue-500 border-blue-600 text-white') : 'bg-gray-200 border-gray-300 text-gray-400'}`}>{statusIcons[step.key]}</div>
                        <span className={`text-xs ${isActive ? (step.key === 'cancelled' ? 'font-bold text-red-700' : 'font-bold text-blue-700') : 'text-gray-500'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Only show progress bar if not cancelled */}
                {selectedOrder.status !== 'cancelled' && (
                  <div className="relative h-2 bg-gray-100 rounded-full">
                    <div
                      className="absolute h-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-green-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (statusSteps.findIndex(s => s.key === selectedOrder.status) / (statusSteps.length - 2)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                )}
                {selectedOrder.status === 'cancelled' && (
                  <div className="text-red-600 text-xs mt-2 font-semibold flex items-center gap-1"><XCircle className="w-4 h-4" /> Order Cancelled</div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[480px] text-left border">
                    <thead>
                      <tr>
                        <th className="py-2 px-3 border-b">Product</th>
                        <th className="py-2 px-3 border-b">Quantity</th>
                        <th className="py-2 px-3 border-b">Price</th>
                        <th className="py-2 px-3 border-b">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 border-b">{item.productName}</td>
                          <td className="py-2 px-3 border-b">{item.quantity}</td>
                          <td className="py-2 px-3 border-b">KES {item.price.toLocaleString()}</td>
                          <td className="py-2 px-3 border-b">KES {(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Shipping Info & Tracking Number */}
              <div className="border-t pt-4 bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Shipping Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-70" /><strong>Shipping Address:</strong> {selectedOrder.shippingAddress || 'N/A'}</div>
                  <div className="flex items-center gap-2"><Hash className="w-4 h-4 opacity-70" /><strong>Tracking Number:</strong> {selectedOrder.trackingNumber || 'N/A'}</div>
                </div>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-4">
                <span>Total:</span>
                <span>KES {selectedOrder.total.toLocaleString()}</span>
              </div>
              <div>
                <Badge variant={statusColors[selectedOrder.status] || 'secondary'}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Orders; 