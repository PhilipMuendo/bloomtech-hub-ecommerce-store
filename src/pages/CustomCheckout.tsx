import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MpesaPaymentModal from '@/components/MpesaPaymentModal';

const CustomCheckout = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMpesa, setShowMpesa] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch by tracking number first (for quote-based orders)
        let res = await fetch(`/api/orders/tracking/${orderId}`);
        
        if (!res.ok) {
          // If that fails, try by order ID (for authenticated users)
          if (user?.token) {
            res = await fetch(`/api/orders/${orderId}`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
          }
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch order');
        }
        
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Error loading order');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) fetchOrder();
  }, [user, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
            <CardDescription>The order you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Custom Order</CardTitle>
            <CardDescription>
              Order #{order.trackingNumber || order._id?.slice(-6) || order.id?.toString().slice(-6) || 'N/A'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            
            <Separator />
            
            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item: any, index: number) => (
                  <div key={item._id || item.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.productName || `Product ${item.productId}`}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">KES {(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">KES {item.price?.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Total */}
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-primary">KES {order.total?.toLocaleString()}</span>
            </div>
            
            {/* Payment Button */}
            {order.status === 'pending' && (
              <div className="pt-4">
                <Button 
                  onClick={() => setShowMpesa(true)} 
                  className="w-full"
                  size="lg"
                >
                  Proceed to Payment
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Secure payment via M-Pesa
                </p>
              </div>
            )}
            
            {order.status !== 'pending' && (
              <div className="pt-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    {order.status === 'paid' ? 'Payment completed successfully!' :
                     order.status === 'processing' ? 'Your order is being processed.' :
                     order.status === 'delivered' ? 'Your order has been delivered!' :
                     'This order has been processed.'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* M-Pesa Payment Modal */}
        <MpesaPaymentModal
          isOpen={showMpesa}
          onClose={() => setShowMpesa(false)}
          orderId={order._id || order.id}
          amount={order.total}
          onSuccess={() => {
            alert('Payment successful!');
            setShowMpesa(false);
            // Refresh the page to update status
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
};

export default CustomCheckout; 