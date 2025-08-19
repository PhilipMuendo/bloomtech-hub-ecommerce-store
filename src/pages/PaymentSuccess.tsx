import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Home, ShoppingCart, Receipt } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');
  const trackingId = searchParams.get('trackingId');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const token = user?.token || (typeof window !== 'undefined' && localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).token);
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-green-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-green-800">
                  Order Confirmation
                </CardTitle>
                <CardDescription className="text-green-600">
                  Your order has been successfully processed
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {status === 'completed' ? 'Paid' : status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {orderDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order ID</p>
                    <p className="text-lg font-semibold">{orderDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-lg font-semibold text-green-600">
                      KES {orderDetails.total?.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {trackingId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {trackingId}
                    </p>
                  </div>
                )}

                {orderDetails.items && orderDetails.items.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Order Items</p>
                    <div className="space-y-2">
                      {orderDetails.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="font-medium">{item.productName || 'Product'}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">KES {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orderDetails.shippingAddress && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {orderDetails.shippingAddress}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {orderId ? 'Order details not available' : 'No order ID provided'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Order Confirmation Email</p>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation email with your order details shortly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-gray-600">
                    Our team will process your order and prepare it for shipping.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Shipping Updates</p>
                  <p className="text-sm text-gray-600">
                    You'll receive updates on your order status and tracking information.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/orders">
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Orders
            </Link>
          </Button>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@bloomtechhub.com" className="text-blue-600 hover:underline">
              support@bloomtechhub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
