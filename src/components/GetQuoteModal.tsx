import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShoppingBag } from 'lucide-react';
import { Quote, NewQuoteItem } from '@/types';

interface GetQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NewQuoteItem[];
  userInfo?: { name?: string; email?: string; phone?: string };
}

const GetQuoteModal: React.FC<GetQuoteModalProps> = ({ open, onOpenChange, items, userInfo }) => {
  const { user } = useAuth();
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          message,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit quote request');
      setSuccess(true);
      toast({ title: 'Quote request sent', description: 'We will contact you soon.' });
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Request a Custom Quote</DialogTitle>
          <p className="text-sm text-muted-foreground">Our team will get back to you with a special price for your items.</p>
        </DialogHeader>
        {success ? (
          <div className="text-center py-8 text-green-600 font-semibold">Thank you! Your quote request has been sent.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <ShoppingBag className="h-4 w-4" />
                Your Items
              </h3>
              <ul className="space-y-1 pl-2 text-sm">
                {items.map(item => (
                  <li key={item.productId} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-mono">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <input className="w-full rounded-md border p-2 text-sm" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <input className="w-full rounded-md border p-2 text-sm" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone (Optional)</label>
              <input className="w-full rounded-md border p-2 text-sm" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Message (Optional)</label>
              <textarea className="w-full rounded-md border p-2 text-sm" rows={3} value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit Quote Request'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GetQuoteModal; 