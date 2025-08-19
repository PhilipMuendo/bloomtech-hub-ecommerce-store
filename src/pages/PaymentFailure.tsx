import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, AlertTriangle, Home, ShoppingCart, RefreshCw } from 'lucide-react';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');
  const reason = searchParams.get('reason') || 'Payment was not completed successfully';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Failure Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600">
            We couldn't process your payment. Please try again.
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-red-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-red-800">
                  Payment Error
                </CardTitle>
                <CardDescription className="text-red-600">
                  Your payment could not be completed
                </CardDescription>
              </div>
              <Badge variant="destructive">
                {status === 'failed' ? 'Failed' : status || 'Error'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {orderId && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Order ID</p>
                  <p className="text-lg font-semibold">{orderId}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Error Details</p>
                <p className="text-sm bg-red-50 p-3 rounded border border-red-200">
                  {reason}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">Don't worry!</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your order has been saved and you can try the payment again. No charges have been made to your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Solutions */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Try These Solutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Check Your Payment Method</p>
                  <p className="text-sm text-gray-600">
                    Ensure your card or mobile money account has sufficient funds.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Try a Different Payment Method</p>
                  <p className="text-sm text-gray-600">
                    Use a different card or mobile money service.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Contact Your Bank</p>
                  <p className="text-sm text-gray-600">
                    Some banks may block online transactions for security reasons.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1 bg-red-600 hover:bg-red-700">
            <Link to="/cart">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Try Payment Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Still having issues? Contact us at{' '}
            <a href="mailto:support@bloomtechhub.com" className="text-blue-600 hover:underline">
              support@bloomtechhub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
