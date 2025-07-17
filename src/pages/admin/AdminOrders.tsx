import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: string; // Added for shipping address
}

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '12');
        if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
        if (dateFrom) params.set('fromDate', dateFrom);
        if (dateTo) params.set('toDate', dateTo);
        // Look for token in both 'jwt' and 'user' keys
        let token = localStorage.getItem('jwt');
        if (!token) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          token = user.token;
        }
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`/api/orders?${params.toString()}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        // Normalize order data for display
        const normalized = data.orders.map((o: any) => ({
          id: o._id || o.id,
          customerName: o.customerName || (o.userId?.name ?? 'N/A'),
          customerEmail: o.customerEmail || (o.userId?.email ?? 'N/A'),
          date: o.createdAt,
          status: o.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
          total: o.total,
          items: o.items || [],
          shippingAddress: o.shippingAddress, // Normalize shipping address
        }));
        setOrders(normalized);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        let errorMsg = 'An unknown error occurred';
        if (err && err.response && err.response.error) {
          errorMsg = err.response.error;
        } else if (err && err.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    // eslint-disable-next-line
  }, [page, statusFilter, dateFrom, dateTo]);

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date).setHours(0,0,0,0);
    const from = dateFrom ? new Date(dateFrom).setHours(0,0,0,0) : null;
    const to = dateTo ? new Date(dateTo).setHours(0,0,0,0) : null;
    if (from && orderDate < from) return false;
    if (to && orderDate > to) return false;
    // Also apply search filter
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      let token = localStorage.getItem('jwt');
      if (!token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        token = user.token;
      }
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update order status');
      toast({
        title: "Order Updated",
        description: `Order ${orderId} status changed to ${newStatus}`,
        duration: 1000,
      });
      // Update the order's status in local state immediately
      setOrders(prevOrders => prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      // Optionally refresh orders from server:
      // setPage(1);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update order status',
        variant: 'destructive',
        duration: 1000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            {filteredOrders.length} of {orders.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:gap-4 gap-4 mb-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] sm:w-[180px] h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="w-full overflow-x-auto">
            <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>KES {order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select onValueChange={(value) => updateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-[120px] h-8">
                          <Package className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button onClick={handlePrevPage} disabled={page === 1} variant="outline">Previous</Button>
            <span>Page {page} of {totalPages}</span>
            <Button onClick={handleNextPage} disabled={page === totalPages} variant="outline">Next</Button>
          </div>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.id}</DialogTitle>
              <DialogDescription>
                Complete order information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Customer Information</h4>
                  <p>{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Order Information</h4>
                  <p>Date: {new Date(selectedOrder.date).toLocaleDateString()}</p>
                  <p>Status: <Badge variant={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName || 'N/A'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>KES {item.price.toLocaleString()}</TableCell>
                        <TableCell>KES {(item.quantity * item.price).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>KES {selectedOrder.total.toLocaleString()}</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <strong>Shipping Address:</strong> {selectedOrder.shippingAddress || 'N/A'}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminOrders;