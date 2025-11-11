import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  DollarSign,
  Calendar,
  User,
  Package,
  Search,
  Filter
} from 'lucide-react';

interface BankTransferOrder {
  id: number;
  trackingNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  User: {
    name: string;
    email: string;
    phone: string;
  };
  OrderItems: Array<{
    quantity: number;
    Product: {
      name: string;
      price: number;
    };
  }>;
  contactPhone?: string;
}

const BankTransferOrders = () => {
  const [orders, setOrders] = useState<BankTransferOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<BankTransferOrder | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/bank-transfer/orders', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load bank transfer orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!selectedOrder || isConfirmingPayment) return;

    if (!paymentReference.trim()) {
      toast({
        title: "Payment Reference Required",
        description: "Please enter the payment reference",
        variant: "destructive"
      });
      return;
    }

    const enteredAmount = parseFloat(paymentAmount);
    if (isNaN(enteredAmount) || Math.abs(enteredAmount - selectedOrder.total) > 0.01) {
      toast({
        title: "Amount Mismatch",
        description: `Payment amount must be exactly ${formatAmount(selectedOrder.total)}`,
        variant: "destructive"
      });
      return;
    }

    setIsConfirmingPayment(true);

    try {
      const response = await fetch(`/api/bank-transfer/confirm-payment/${selectedOrder.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentReference: paymentReference.trim(),
          amount: parseFloat(paymentAmount),
          notes: notes.trim()
        })
      });

      if (response.ok) {
        toast({
          title: "Payment Confirmed",
          description: "Order status updated and customer notified",
          variant: "default"
        });
        setShowConfirmDialog(false);
        setSelectedOrder(null);
        setPaymentReference('');
        setPaymentAmount('');
        setNotes('');
        fetchOrders(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm payment');
      }
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive"
      });
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const openConfirmDialog = (order: BankTransferOrder) => {
    setSelectedOrder(order);
    setPaymentAmount(order.total.toString());
    setPaymentReference('');
    setNotes('');
    setShowConfirmDialog(true);
  };

  const openDetailsDialog = (order: BankTransferOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  useEffect(() => {
    if (user?.token) {
      fetchOrders();
    }
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.User.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.User.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading bank transfer orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-orange-600" />
            Bank Transfer Orders
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage orders requiring bank transfer payment
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bank transfer orders found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Orders requiring bank transfer will appear here'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          Order #{order.trackingNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <span className="text-lg font-bold text-green-600">
                          {formatAmount(order.total)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{order.User.name}</p>
                          <p className="text-sm text-muted-foreground">{order.User.email}</p>
                          <p className="text-sm text-muted-foreground">{order.contactPhone || order.User?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Items ({order.OrderItems.length})</p>
                        <div className="space-y-1">
                          {order.OrderItems.map((item, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              {item.Product.name} × {item.quantity}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                                         {order.status === 'pending' && (
                       <Button
                         onClick={() => openConfirmDialog(order)}
                         className="bg-green-600 hover:bg-green-700"
                         disabled={isConfirmingPayment}
                       >
                         <CheckCircle className="h-4 w-4 mr-2" />
                         Confirm Payment
                       </Button>
                     )}
                                         <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => openDetailsDialog(order)}
                       disabled={isConfirmingPayment}
                     >
                       <Eye className="h-4 w-4 mr-2" />
                       View Details
                     </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Bank Transfer Payment</DialogTitle>
            <DialogDescription>
              Confirm that payment has been received for order #{selectedOrder?.trackingNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentReference">Payment Reference *</Label>
              <Input
                id="paymentReference"
                placeholder="Enter payment reference from bank"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="paymentAmount">Payment Amount *</Label>
              <Input
                id="paymentAmount"
                type="number"
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
                             {selectedOrder && (() => {
                 const enteredAmount = parseFloat(paymentAmount);
                 const isValid = !isNaN(enteredAmount) && Math.abs(enteredAmount - selectedOrder.total) <= 0.01;
                 return !isValid && paymentAmount !== '' && (
                   <p className="text-sm text-red-600 mt-1">
                     Amount must be exactly {formatAmount(selectedOrder.total)}
                   </p>
                 );
               })()}
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the payment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

                     <DialogFooter>
             <Button 
               variant="outline" 
               onClick={() => setShowConfirmDialog(false)}
               disabled={isConfirmingPayment}
             >
               Cancel
             </Button>
             <Button 
               onClick={confirmPayment} 
               className="bg-green-600 hover:bg-green-700"
               disabled={isConfirmingPayment}
             >
               {isConfirmingPayment ? (
                 <>
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                   Confirming...
                 </>
               ) : (
                 <>
                   <CheckCircle className="h-4 w-4 mr-2" />
                   Confirm Payment
                 </>
               )}
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Detailed information for order #{selectedOrder?.trackingNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Order Information</h4>
                  <p><strong>Order ID:</strong> #{selectedOrder.trackingNumber}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                  <p><strong>Payment Method:</strong> Bank Transfer</p>
                  <p><strong>Date Created:</strong> {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Financial Information</h4>
                  <p><strong>Total Amount:</strong> <span className="text-green-600 font-bold">{formatAmount(selectedOrder.total)}</span></p>
                  <p><strong>Payment Status:</strong> {selectedOrder.status === 'pending' ? 'Awaiting Payment' : 'Payment Confirmed'}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Name:</strong> {selectedOrder.User.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.User.email}</p>
                  </div>
                  <div>
                    <p><strong>Phone:</strong> {selectedOrder.contactPhone || selectedOrder.User?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Items ({selectedOrder.OrderItems.length})
                </h4>
                <div className="space-y-3">
                  {selectedOrder.OrderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.Product.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatAmount(item.Product.price)}</p>
                        <p className="text-sm text-gray-600">Total: {formatAmount(item.Product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Order Value:</span>
                    <span className="text-xl font-bold text-green-600">{formatAmount(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailsDialog(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                                 {selectedOrder.status === 'pending' && (
                   <Button 
                     onClick={() => {
                       setShowDetailsDialog(false);
                       openConfirmDialog(selectedOrder);
                     }}
                     className="flex-1 bg-green-600 hover:bg-green-700"
                     disabled={isConfirmingPayment}
                   >
                     <CheckCircle className="h-4 w-4 mr-2" />
                     Confirm Payment
                   </Button>
                 )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankTransferOrders;
