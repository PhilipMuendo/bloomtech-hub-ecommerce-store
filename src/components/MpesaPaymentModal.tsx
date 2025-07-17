import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onSuccess: () => void;
}

const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    return phone;
  };

  const initiateMpesaPayment = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      const response = await fetch('/api/payments/mpesa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          phone: phoneNumber,
          amount,
          orderId
        })
      });

      const data = await response.json();

      if (data.success) {
        setCheckoutRequestId(data.data.checkoutRequestId);
        toast({
          title: "STK Push Sent",
          description: "Check your phone for the M-Pesa prompt and enter your PIN",
          duration: 1000,
        });
        
        // Start polling for payment status
        pollPaymentStatus(data.data.checkoutRequestId);
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('failed');
      setResultMessage(error instanceof Error ? error.message : 'Payment initiation failed');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Failed to initiate payment',
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutId: string) => {
    const maxAttempts = 30; // Poll for 2.5 minutes (30 * 5 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/mpesa/status/${checkoutId}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          const { status, resultDesc, mpesaReceiptNumber } = data.data;

          if (status === 'completed') {
            setPaymentStatus('completed');
            setResultMessage(`Payment successful! Receipt: ${mpesaReceiptNumber}`);
            toast({
              title: "Payment Successful",
              description: `Your order has been paid successfully. Receipt: ${mpesaReceiptNumber}`,
              duration: 1000,
            });
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
            return;
          } else if (status === 'failed' || status === 'cancelled') {
            setPaymentStatus('failed');
            setResultMessage(resultDesc || 'Payment failed');
            toast({
              title: "Payment Failed",
              description: resultDesc || 'Payment failed',
              variant: "destructive",
              duration: 1000,
            });
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        } else {
          setPaymentStatus('failed');
          setResultMessage('Payment timeout. Please try again.');
          toast({
            title: "Payment Timeout",
            description: "Payment verification timed out. Please check your M-Pesa messages.",
            variant: "destructive",
            duration: 1000,
          });
        }
      } catch (error) {
        console.error('Status check error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
      }
    };

    checkStatus();
  };

  const mockPayment = async (success: boolean) => {
    if (process.env.NODE_ENV === 'production') return;

    try {
      const response = await fetch('/api/payments/mpesa/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          orderId,
          success
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (success) {
          setPaymentStatus('completed');
          setResultMessage('Mock payment completed successfully');
          toast({
            title: "Mock Payment Successful",
            description: "Order payment completed (development mode)",
            duration: 1000,
          });
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else {
          setPaymentStatus('failed');
          setResultMessage('Mock payment failed');
          toast({
            title: "Mock Payment Failed",
            description: "Payment failed (development mode)",
            variant: "destructive",
            duration: 1000,
          });
        }
      }
    } catch (error) {
      console.error('Mock payment error:', error);
    }
  };

  const resetModal = () => {
    setPhoneNumber('');
    setPaymentStatus('idle');
    setCheckoutRequestId('');
    setResultMessage('');
    setIsProcessing(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Smartphone className="h-8 w-8 text-green-600" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Processing Payment...';
      case 'completed':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Pay with M-Pesa';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {formatAmount(amount)}
            </p>
            <p className="text-sm text-muted-foreground">
              Order ID: {orderId}
            </p>
          </div>

          {paymentStatus === 'idle' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your M-Pesa registered phone number
                </p>
              </div>

              <Button 
                onClick={initiateMpesaPayment}
                disabled={isProcessing || !phoneNumber}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initiating Payment...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Pay with M-Pesa
                  </>
                )}
              </Button>

              {process.env.NODE_ENV !== 'production' && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-xs text-muted-foreground text-center">
                    Development Mode - Mock Payments
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => mockPayment(true)}
                      className="flex-1"
                    >
                      Mock Success
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => mockPayment(false)}
                      className="flex-1"
                    >
                      Mock Failure
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Please check your phone for the M-Pesa payment request
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Enter your M-Pesa PIN when prompted
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Waiting for payment confirmation... This may take up to 2 minutes
              </p>
            </div>
          )}

          {(paymentStatus === 'completed' || paymentStatus === 'failed') && (
            <div className="text-center space-y-4">
              <div className={`p-4 rounded-lg ${
                paymentStatus === 'completed' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className={`text-sm font-medium ${
                  paymentStatus === 'completed' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {resultMessage}
                </p>
              </div>
              
              {paymentStatus === 'failed' && (
                <Button 
                  onClick={resetModal}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPaymentModal;