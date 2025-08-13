import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Smartphone, CreditCard, Shield, Clock } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  processingTime: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onProceed: () => void;
  onCancel?: () => void;
  amount: number;
  disabled?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  onProceed,
  onCancel,
  amount,
  disabled = false
}) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pesapal',
      name: 'Pesapal',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Pay with M-Pesa, card, or other mobile money',
      features: ['M-Pesa included', 'Credit/Debit cards', 'Multiple mobile money options', 'Secure payments'],
      processingTime: 'Instant'
    }
  ];

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
        <h2 className="text-2xl font-bold mb-2">Choose Payment Method</h2>
        <p className="text-muted-foreground">Select your preferred payment method</p>
        <div className="mt-4">
          <span className="text-3xl font-bold text-primary">{formatAmount(amount)}</span>
        </div>
      </div>

      <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={`cursor-pointer transition-all ${
              selectedMethod === method.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="flex items-center space-x-2">
                      {method.icon}
                      <div>
                        <CardTitle className="text-lg">{method.name}</CardTitle>
                        <CardDescription>{method.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{method.processingTime}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {method.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </RadioGroup>

      <div className="space-y-4">
        <Button
          onClick={onProceed}
          disabled={!selectedMethod || disabled}
          className="w-full bg-primary hover:bg-primary/90 text-white"
          size="lg"
        >
          {disabled ? 'Processing...' : `Pay ${formatAmount(amount)} with ${selectedMethod === 'mpesa' ? 'M-Pesa' : 'Pesapal'}`}
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
          <p>💰 No additional fees for any payment method</p>
          <p>🔄 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector; 