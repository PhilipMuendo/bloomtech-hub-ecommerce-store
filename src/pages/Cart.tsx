import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import NewsletterForm from '@/components/NewsletterForm';
import PesapalPaymentModal from '@/components/PesapalPaymentModal';
import GetQuoteModal from '@/components/GetQuoteModal';
import { Tag } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPesapalModal, setShowPesapalModal] = React.useState(false);
  const [currentOrderId, setCurrentOrderId] = React.useState('');
  const [showQuote, setShowQuote] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // If returning from shipping info, show payment modal after order creation
    const params = new URLSearchParams(window.location.search);
    if (params.get('shipping') === 'done') {
      handleOrderWithShipping();
    }
    // eslint-disable-next-line
  }, []);

  const handleOrderWithShipping = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      return;
    }
    const pickupPoint = localStorage.getItem('pickupPoint') || '';
    if (!pickupPoint) {
      toast({
        title: "Shipping Info Required",
        description: "Please select a pickup point.",
        variant: "destructive"
      });
      return;
    }
    try {
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
          total: getTotalPrice(),
          shippingAddress: pickupPoint
        })
      });
      const orderData = await orderResponse.json();
      if (orderData._id) {
        setCurrentOrderId(orderData._id);
      setShowPesapalModal(true);
        localStorage.removeItem('pickupPoint');
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

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      return;
    }
    // Redirect to shipping info page
    navigate('/shipping');
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
      <div className="container mx-auto px-2 sm:px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-base sm:text-lg">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild size="lg" className="text-base sm:text-lg px-6 py-3">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <img
                  src={item.image || '/placeholder.svg'}
                  alt={item.name}
                  className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded"
                />
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm capitalize">
                    {item.category === 'ict' ? 'ICT Equipment' : 'Electrical Materials'}
                  </p>
                  <p className="font-bold text-primary text-base sm:text-lg">{formatPrice(item.price)}</p>
                </div>
                <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 min-w-fit items-center sm:items-start">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1"
                    >
                      -
                    </Button>
                    <span className="w-10 sm:w-12 text-center text-base">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1"
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs sm:text-sm"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 space-y-5 sm:space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 sm:pt-4">
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
          <Button onClick={handleCheckout} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-6 py-3" size="lg">
            Proceed to Pay
          </Button>
                <Button
                  variant="secondary"
                  className="w-full flex items-center gap-2 mt-4 border-dashed border-2 border-accent hover:bg-accent/10"
                  onClick={() => setShowQuote(true)}
                >
                  <Tag className="w-5 h-5 text-accent" />
                  Request Bulk Quote
                </Button>
                <Button asChild variant="outline" className="w-full text-base sm:text-lg px-6 py-3">
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-3 sm:pt-4 space-y-1">
                <p>• Free delivery within Nairobi</p>
                <p>• Secure payment processing</p>
                <p>• 30-day return policy</p>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Signup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Stay Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Subscribe to get updates on new products and special offers.
              </p>
              <NewsletterForm />
            </CardContent>
          </Card>
        </div>
      </div>

      <PesapalPaymentModal
        isOpen={showPesapalModal}
        onClose={() => setShowPesapalModal(false)}
        orderId={currentOrderId}
        amount={getTotalPrice()}
        onSuccess={handlePaymentSuccess}
      />
      <GetQuoteModal
        open={showQuote}
        onOpenChange={setShowQuote}
        items={cartItems.map(item => ({ productId: item.id, name: item.name, quantity: item.quantity }))}
        userInfo={user ? { name: user.name, email: user.email, ...(user.phone ? { phone: user.phone } : {}) } : {}}
      />
    </div>
  );
};

export default Cart;
