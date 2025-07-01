
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
      await addDoc(collection(db, 'restock_alerts'), {
        email,
        productId,
        requestedAt: new Date()
      });
      
      setEmail('');
      toast({ title: "We'll notify you when this item is back in stock!" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save alert. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notify Me When Available</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Notify Me'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BackInStockAlert;
