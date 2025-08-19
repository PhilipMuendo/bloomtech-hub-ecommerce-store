import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Clock, CreditCard } from 'lucide-react';

interface PaymentConfirmationProps {
  onProceed: () => void;
  onCancel?: () => void;
  amount: number;
  disabled?: boolean;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  onProceed,
  onCancel,
  amount,
  disabled = false
}) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Complete Your Order</h2>
        <p className="text-muted-foreground">Review your order and proceed to payment</p>
        <div className="mt-4">
          <span className="text-3xl font-bold text-primary">{formatAmount(amount)}</span>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-lg">Secure Payment</CardTitle>
                <CardDescription>Multiple payment options available</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Instant</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Mobile money & cards accepted</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Instant payment processing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button
          onClick={onProceed}
          disabled={disabled}
          className="w-full bg-primary hover:bg-primary/90 text-white"
          size="lg"
        >
          {disabled ? 'Processing...' : `Proceed to Payment - ${formatAmount(amount)}`}
        </Button>
        
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Cancel
          </Button>
        )}
        
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>🔒 All payments are secured with bank-level encryption</p>
          <p>💰 No additional fees</p>
          <p>🔄 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation; 