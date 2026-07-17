import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Package, CheckCircle, User, Mail, Phone, MapPin, Calendar, ShoppingBag, Filter, SortAsc, SortDesc, Printer, AlertTriangle, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: string;
  deliveredAt?: string;
  trackingNumber?: string;
}

// Orders sitting unfulfilled longer than this get a visible "overdue" flag —
// there was previously no way to see which orders needed urgent attention,
// only a plain date-created sort.
const OVERDUE_DAYS = 2;
const isOverdue = (order: Pick<Order, 'status' | 'date'>) => {
  if (order.status === 'delivered' || order.status === 'cancelled') return false;
  const ageMs = Date.now() - new Date(order.date).getTime();
  return ageMs > OVERDUE_DAYS * 24 * 60 * 60 * 1000;
};

const WarehouseOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let token = localStorage.getItem('jwt');
        if (!token) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          token = user.token;
        }
        
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch('/api/orders?limit=50', { headers });
        if (!res.ok) throw new Error('Failed to fetch orders');
        
        const data = await res.json();
        const normalized = data.orders.map((o: any) => ({
          id: o.id,
          customerName: o.User?.name || o.customerName || 'N/A',
          customerEmail: o.User?.email || o.customerEmail || 'N/A',
          customerPhone: o.contactPhone || o.User?.phone || 'N/A',
          date: o.createdAt,
          status: o.status || 'pending', // Default to pending if status is null/undefined
          total: o.total,
          items: o.items?.map((item: any) => ({
            productName: item.productName || item.Product?.name || 'N/A',
            quantity: item.quantity,
            price: item.price || item.Product?.price || 0,
          })) || [],
          shippingAddress: o.shippingAddress,
          deliveredAt: o.deliveredAt,
          trackingNumber: o.trackingNumber,
        }));
        
        setOrders(normalized);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch orders',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [toast]);

  const processOrder = async (orderId: string) => {
    setProcessingOrder(orderId);
    try {
      let token = localStorage.getItem('jwt');
      if (!token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        token = user.token;
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'processing' })
      });
      
      if (!res.ok) throw new Error('Failed to update order status');
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'processing' as const }
          : order
      ));
      
      toast({
        title: 'Success',
        description: 'Order status updated to processing',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const deliverOrder = async (orderId: string, trackingNumber?: string) => {
    setProcessingOrder(orderId);
    try {
      let token = localStorage.getItem('jwt');
      if (!token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        token = user.token;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: 'delivered',
          ...(trackingNumber?.trim() ? { trackingNumber: trackingNumber.trim() } : {}),
        })
      });

      if (!res.ok) throw new Error('Failed to update order status');

      const updatedOrder = await res.json();

      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'delivered' as const, deliveredAt: updatedOrder.deliveredAt, trackingNumber: updatedOrder.trackingNumber }
          : order
      ));
      setTrackingInputs(prev => { const next = { ...prev }; delete next[orderId]; return next; });

      toast({
        title: 'Success',
        description: 'Order status updated to delivered',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const printPackingSlip = (order: Order) => {
    const itemsRows = order.items.map(item =>
      `<tr><td style="padding:8px 0; border-bottom:1px solid #ddd;">${item.productName}</td>
       <td style="padding:8px 0; border-bottom:1px solid #ddd; text-align:center;">${item.quantity}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><title>Packing Slip - Order #${order.id}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #111; }
        h1 { font-size: 20px; border-bottom: 2px solid #111; padding-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { text-align: left; border-bottom: 2px solid #111; padding: 8px 0; }
        .meta { margin: 16px 0; }
        .meta p { margin: 4px 0; }
        @media print { body { margin: 0; } }
      </style></head>
      <body>
        <h1>Packing Slip — Order #${order.id}</h1>
        <div class="meta">
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          <p><strong>Shipping Address:</strong> ${order.shippingAddress || 'N/A'}</p>
          <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
          ${order.trackingNumber ? `<p><strong>Tracking #:</strong> ${order.trackingNumber}</p>` : ''}
        </div>
        <table>
          <thead><tr><th>Product</th><th style="text-align:center;">Qty</th></tr></thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </body></html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast({ title: 'Popup blocked', description: 'Allow popups to print packing slips.', variant: 'destructive' });
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedOrders = orders
    .filter(order => {
      // Search filter
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(order.id).toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'overdue' ? isOverdue(order) : order.status === statusFilter);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'customer':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case 'total':
          comparison = (a.total || 0) - (b.total || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Warehouse Orders</h1>
        <p className="text-gray-600">Manage and process customer orders</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="text-xs"
                >
                  Clear Filter
                </Button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Quick overview of order statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div
              className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${
                statusFilter === 'overdue'
                  ? 'bg-red-100 border-2 border-red-400 shadow-md'
                  : 'bg-red-50 hover:bg-red-100'
              }`}
              onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
            >
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => isOverdue(o)).length}
              </div>
              <div className="text-sm text-red-700 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue
              </div>
            </div>
            <div
              className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${
                statusFilter === 'pending'
                  ? 'bg-yellow-100 border-2 border-yellow-400 shadow-md' 
                  : 'bg-yellow-50 hover:bg-yellow-100'
              }`}
              onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            >
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div 
              className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${
                statusFilter === 'processing' 
                  ? 'bg-blue-100 border-2 border-blue-400 shadow-md' 
                  : 'bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={() => setStatusFilter(statusFilter === 'processing' ? 'all' : 'processing')}
            >
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'processing').length}
              </div>
              <div className="text-sm text-blue-700">Processing</div>
            </div>
            <div 
              className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${
                statusFilter === 'delivered' 
                  ? 'bg-green-100 border-2 border-green-400 shadow-md' 
                  : 'bg-green-50 hover:bg-green-100'
              }`}
              onClick={() => setStatusFilter(statusFilter === 'delivered' ? 'all' : 'delivered')}
            >
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-green-700">Delivered</div>
            </div>
            <div 
              className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${
                statusFilter === 'cancelled' 
                  ? 'bg-red-100 border-2 border-red-400 shadow-md' 
                  : 'bg-red-50 hover:bg-red-100'
              }`}
              onClick={() => setStatusFilter(statusFilter === 'cancelled' ? 'all' : 'cancelled')}
            >
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelled').length}
              </div>
              <div className="text-sm text-red-700">Cancelled</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {filteredAndSortedOrders.length} orders found
            {statusFilter !== 'all' && (
              <span className="text-blue-600 font-medium"> • Filtered by: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('customer')}
                    >
                      <div className="flex items-center gap-1">
                        Customer
                        {sortBy === 'customer' && (
                          sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortBy === 'date' && (
                          sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortBy === 'status' && (
                          sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center gap-1">
                        Total
                        {sortBy === 'total' && (
                          sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-gray-500">Customer</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerEmail}</div>
                          <div className="text-sm text-gray-500">{order.customerPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1).replace('_', ' ')}
                          </Badge>
                          {isOverdue(order) && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600" title={`Unfulfilled for more than ${OVERDUE_DAYS} days`}>
                              <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.status === 'delivered' && order.deliveredAt ? (
                          <div className="text-sm">
                            <div className="font-medium text-green-600">
                              {new Date(order.deliveredAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.deliveredAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        KES {order.total?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printPackingSlip(order)}
                          >
                            <Printer className="w-4 h-4 mr-1" />
                            Slip
                          </Button>
                          {(order.status === 'pending' || !order.status) && (
                            <Button
                              size="sm"
                              onClick={() => processOrder(order.id)}
                              disabled={processingOrder === order.id}
                            >
                              {processingOrder === order.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                              ) : (
                                <Package className="w-4 h-4 mr-1" />
                              )}
                              Process
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <>
                              <Input
                                placeholder="Tracking # (optional)"
                                value={trackingInputs[order.id] || ''}
                                onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                className="h-9 w-40 text-xs"
                              />
                              <Button
                                size="sm"
                                onClick={() => deliverOrder(order.id, trackingInputs[order.id])}
                                disabled={processingOrder === order.id}
                              >
                                {processingOrder === order.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                )}
                                Deliver
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Order Details - #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Complete customer and order information
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{selectedOrder.customerName}</p>
                        <p className="text-sm text-gray-500">Customer Name</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{selectedOrder.customerEmail}</p>
                        <p className="text-sm text-gray-500">Email Address</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{selectedOrder.customerPhone}</p>
                        <p className="text-sm text-gray-500">Phone Number</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Order Date</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOrder.shippingAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium">Shipping Address</p>
                        <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Order Items ({selectedOrder.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">KES {item.price?.toLocaleString() || '0'}</p>
                          <p className="text-sm text-gray-500">Total: KES {(item.price * item.quantity)?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">Order Status</span>
                        {isOverdue(selectedOrder) && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                          </span>
                        )}
                      </div>
                      {selectedOrder.status === 'delivered' && selectedOrder.deliveredAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="font-medium text-green-600">
                              Delivered on {new Date(selectedOrder.deliveredAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">Delivery Date</p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.trackingNumber && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{selectedOrder.trackingNumber}</p>
                            <p className="text-sm text-gray-500">Tracking Number</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">KES {selectedOrder.total?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {selectedOrder.status === 'processing' && (
                    <div className="mt-4 pt-4 border-t">
                      <label className="text-sm text-gray-500 mb-1 block">Tracking Number (optional)</label>
                      <Input
                        placeholder="e.g. carrier tracking code"
                        value={trackingInputs[selectedOrder.id] || ''}
                        onChange={(e) => setTrackingInputs(prev => ({ ...prev, [selectedOrder.id]: e.target.value }))}
                      />
                    </div>
                  )}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => printPackingSlip(selectedOrder)}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print Slip
                    </Button>
                    {selectedOrder.status === 'pending' && (
                      <Button
                        onClick={() => {
                          processOrder(selectedOrder.id);
                          setIsViewDialogOpen(false);
                        }}
                        disabled={processingOrder === selectedOrder.id}
                        className="flex-1"
                      >
                        {processingOrder === selectedOrder.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Package className="w-4 h-4 mr-2" />
                        )}
                        Process Order
                      </Button>
                    )}
                    {selectedOrder.status === 'processing' && (
                      <Button
                        onClick={() => {
                          deliverOrder(selectedOrder.id, trackingInputs[selectedOrder.id]);
                          setIsViewDialogOpen(false);
                        }}
                        disabled={processingOrder === selectedOrder.id}
                        className="flex-1"
                      >
                        {processingOrder === selectedOrder.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseOrders; 