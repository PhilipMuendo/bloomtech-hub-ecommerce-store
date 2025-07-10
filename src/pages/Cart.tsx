import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import NewsletterForm from '@/components/NewsletterForm';
import MpesaPaymentModal from '@/components/MpesaPaymentModal';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showMpesaModal, setShowMpesaModal] = React.useState(false);
  const [currentOrderId, setCurrentOrderId] = React.useState('');

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create order first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity
          })),
          total: getTotalPrice()
        })
      });

      const orderData = await orderResponse.json();
      
      if (orderData._id) {
        setCurrentOrderId(orderData._id);
        setShowMpesaModal(true);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    toast({ title: "Order placed and paid successfully!" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={item.imageUrl || item.image}
                  alt={item.name}
                  className="w-full sm:w-24 h-24 object-cover rounded"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-muted-foreground text-sm capitalize">
                    {item.category === 'ict' ? 'ICT Equipment' : 'Electrical Materials'}
                  </p>
                  <p className="font-bold text-primary">{formatPrice(item.price)}</p>
                </div>
                <div className="flex flex-col space-y-2 min-w-fit">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                  Pay with M-Pesa
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-4 space-y-1">
                <p>• Free delivery within Nairobi</p>
                <p>• Secure payment processing</p>
                <p>• 30-day return policy</p>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Signup */}
          <Card>
            <CardHeader>
              <CardTitle>Stay Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to get updates on new products and special offers.
              </p>
              <NewsletterForm />
            </CardContent>
          </Card>
        </div>
      </div>

      <MpesaPaymentModal
        isOpen={showMpesaModal}
        onClose={() => setShowMpesaModal(false)}
        orderId={currentOrderId}
        amount={getTotalPrice()}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Cart;
