import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface BankTransferPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onSuccess: (realOrderId?: string) => void;
}

interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  swiftCode: string;
  bankCode: string;
}

const BankTransferPaymentModal: React.FC<BankTransferPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const fetchBankDetails = async () => {
    try {
      const response = await fetch('/api/bank-transfer/bank-details');
      if (response.ok) {
        const data = await response.json();
        setBankDetails(data.bankDetails);
      } else {
        throw new Error('Failed to fetch bank details');
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
      toast({
        title: "Error",
        description: "Failed to load bank details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateProformaInvoice = async () => {
    if (!user?.token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate invoice",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let pendingOrderData: any = null;
      if (orderId.startsWith('TEMP_')) {
        const rawPending = localStorage.getItem('pendingOrderData') || '{}';
        try {
          pendingOrderData = JSON.parse(rawPending);
        } catch (parseErr) {
          pendingOrderData = {};
        }
      }

      if (pendingOrderData) {
        pendingOrderData = {
          ...pendingOrderData,
          contactPhone: pendingOrderData.contactPhone || user?.phone || null
        };
        localStorage.setItem('pendingOrderData', JSON.stringify(pendingOrderData));
      }
      
      const response = await fetch(`/api/bank-transfer/generate-invoice/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pendingOrderData: pendingOrderData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInvoiceData(data.invoice);
        setInvoiceGenerated(true);
        
        // If this was a temporary order, update the orderId to the real one
        if (orderId.startsWith('TEMP_') && data.invoice.orderId) {
          // Update the orderId prop by calling onSuccess with the real order ID
          onSuccess(data.invoice.orderId);
        }
        
        toast({
          title: "Invoice Generated",
          description: "Proforma invoice has been sent to your email",
          variant: "default"
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
      variant: "default"
    });
  };

  React.useEffect(() => {
    if (isOpen && !bankDetails) {
      fetchBankDetails();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Bank Transfer Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span>Order Total:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatAmount(amount)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Orders exceeding KSH 500,000 require bank transfer payment
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          {bankDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Bank Transfer Details</CardTitle>
                <CardDescription>
                  Transfer the exact amount to the following account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Name</label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <span className="flex-1">{bankDetails.accountName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.accountName, 'Account name')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Number</label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <span className="flex-1 font-mono">{bankDetails.accountNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bank Name</label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {bankDetails.bankName}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Branch</label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {bankDetails.branch}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Swift Code</label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <span className="flex-1 font-mono">{bankDetails.swiftCode}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.swiftCode, 'Swift code')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bank Code</label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {bankDetails.bankCode}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Important Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Transfer the exact amount: <strong>{formatAmount(amount)}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Include your order number in the payment reference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Payment must be completed within 7 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Order will be processed once payment is confirmed by our accounts team</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Invoice Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Proforma Invoice
              </CardTitle>
              <CardDescription>
                Generate and send a proforma invoice to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!invoiceGenerated ? (
                <Button
                  onClick={generateProformaInvoice}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Generating...' : 'Generate Proforma Invoice'}
                </Button>
              ) : (
                <div className="text-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                  <p className="text-green-600 font-medium">Invoice Generated Successfully!</p>
                  <p className="text-sm text-gray-600">
                    Check your email for the proforma invoice with complete payment details.
                  </p>
                  {invoiceData && (
                    <div className="mt-4 p-3 bg-blue-50 rounded border">
                      <p className="text-sm">
                        <strong>Invoice Number:</strong> {invoiceData.invoiceNumber}
                      </p>
                      <p className="text-sm">
                        <strong>Due Date:</strong> {new Date(invoiceData.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={onSuccess}
              className="flex-1"
              disabled={!invoiceGenerated}
            >
              Complete Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankTransferPaymentModal;
