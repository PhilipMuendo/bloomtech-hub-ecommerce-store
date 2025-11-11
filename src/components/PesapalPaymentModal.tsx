import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, CreditCard, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface PesapalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onSuccess: () => void;
}

const PesapalPaymentModal: React.FC<PesapalPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const normalizePhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // Remove any non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('+254')) {
      return cleaned.substring(1); // Remove + and return 254...
    } else if (cleaned.startsWith('254')) {
      return cleaned; // Already in correct format
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1); // Replace 0 with 254
    } else if (cleaned.length === 9) {
      return '254' + cleaned; // Add 254 prefix
    }
    
    return cleaned; // Return as is if no pattern matches
  };

  const initiatePesapalPayment = async () => {
    // Validate phone number
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid phone number to proceed with payment",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber.trim());
    if (!normalizedPhone) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');
    try {
      const pendingOrderDataRaw = localStorage.getItem('pendingOrderData') || '{}';
      let pendingOrderData: any;
      try {
        pendingOrderData = JSON.parse(pendingOrderDataRaw);
      } catch (parseErr) {
        pendingOrderData = {};
      }

      const enrichedOrderData = {
        ...pendingOrderData,
        contactPhone: normalizedPhone
      };

      localStorage.setItem('pendingOrderData', JSON.stringify(enrichedOrderData));

      const response = await fetch('/api/payments/pesapal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ 
          orderId,
          amount,
          phoneNumber: normalizedPhone,
          email: user?.email || 'customer@example.com',
          firstName: user?.name?.split(' ')[0] || 'Customer',
          lastName: user?.name?.split(' ').slice(1).join(' ') || 'User',
          orderData: enrichedOrderData
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (data.data?.redirectUrl) {
        setPaymentUrl(data.data.redirectUrl);
        // Open payment URL in new window or iframe
        window.open(data.data.redirectUrl, '_blank');
        // Start polling payment status
        pollPaymentStatus();
      } else {
        throw new Error(data.message || 'Failed to get payment URL');
      }
    } catch (error) {
      setPaymentStatus('failed');
      setResultMessage(error instanceof Error ? error.message : 'Payment initiation failed');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Failed to initiate payment',
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async () => {
    const maxAttempts = 30; // Poll for 2.5 minutes (30 * 5 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/pesapal/status/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        const data = await response.json();
        if (data.status === 'Paid') {
          setPaymentStatus('completed');
          setResultMessage('Payment successful!');
          toast({
            title: "Payment Successful",
            description: "Your order has been paid successfully.",
            duration: 2000,
          });
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
          return;
        } else if (data.status === 'Pending' || data.status === 'Awaiting Payment') {
          // Continue polling
        } else {
          setPaymentStatus('failed');
          setResultMessage('Payment failed or cancelled.');
          toast({
            title: "Payment Failed",
            description: "Payment failed or cancelled.",
            variant: "destructive",
            duration: 2000,
          });
          return;
        }
      } catch (error) {
        // Ignore errors and retry
      }
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 5000);
      } else {
        setPaymentStatus('failed');
        setResultMessage('Payment timeout. Please try again.');
        toast({
          title: "Payment Timeout",
          description: "Payment verification timed out.",
          variant: "destructive",
          duration: 2000,
        });
      }
    };

    checkStatus();
  };

  const resetModal = () => {
    setPaymentStatus('idle');
    setPaymentUrl('');
    setResultMessage('');
    setIsProcessing(false);
    setPhoneNumber(user?.phone || '');
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
        return <CreditCard className="h-8 w-8 text-blue-600" />;
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
        return 'Complete Payment';
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
                 <Label htmlFor="phone" className="flex items-center gap-2">
                   <Phone className="h-4 w-4" />
                   Phone Number (Required for Payment)
                 </Label>
                 <Input
                   id="phone"
                   type="tel"
                   placeholder="e.g., 0712345678 or +254712345678"
                   value={phoneNumber}
                   onChange={(e) => setPhoneNumber(e.target.value)}
                   className="w-full"
                 />
                 <p className="text-xs text-muted-foreground">
                   Enter your phone number to receive payment confirmation
                 </p>
               </div>
               
               <Button
                 onClick={initiatePesapalPayment}
                 disabled={isProcessing}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                 size="lg"
               >
                 {isProcessing ? 'Initiating Payment...' : 'Proceed to Payment'}
               </Button>
             </div>
           )}

          {(paymentStatus === 'pending' || paymentStatus === 'completed' || paymentStatus === 'failed') && (
            <div className="text-center space-y-4">
              <p className={`p-4 rounded-lg ${
                paymentStatus === 'completed' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {resultMessage}
              </p>
              {paymentStatus === 'failed' && (
                <Button onClick={resetModal} variant="outline" className="w-full">
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

export default PesapalPaymentModal;
