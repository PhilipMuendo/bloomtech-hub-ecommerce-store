import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface BackInStockAlertProps {
  productId: string;
}

const BackInStockAlert: React.FC<BackInStockAlertProps> = ({ productId }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock alert subscription
      await new Promise(res => setTimeout(res, 500));
      setEmail('');
      toast({ title: "You'll be notified when the product is back in stock!" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to subscribe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Get Notified</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Label htmlFor="back-in-stock-email">Email</Label>
          <Input
            id="back-in-stock-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
            {loading ? 'Subscribing...' : 'Notify Me'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BackInStockAlert;
