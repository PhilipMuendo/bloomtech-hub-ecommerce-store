import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const initiatePesapalPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('pending');
    try {
      const response = await fetch('/api/payments/pesapal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
        // Open payment URL in new window or iframe
        window.open(data.paymentUrl, '_blank');
        // Start polling payment status
        pollPaymentStatus();
      } else {
        throw new Error('Failed to get payment URL');
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
        return 'Pay with Pesapal';
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
            <Button
              onClick={initiatePesapalPayment}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isProcessing ? 'Initiating Payment...' : 'Pay with Pesapal'}
            </Button>
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
