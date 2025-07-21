import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface QuoteItem {
  productId: string;
  name: string;
  quantity: number;
}

interface GetQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: QuoteItem[];
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Quote</DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="text-center py-8 text-green-600 font-semibold">Thank you! Your quote request has been sent.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="w-full border rounded p-2" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input className="w-full border rounded p-2" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone (optional)</label>
              <input className="w-full border rounded p-2" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Items</label>
              <ul className="list-disc ml-5 text-sm">
                {items.map(item => (
                  <li key={item.productId}>{item.name} x {item.quantity}</li>
                ))}
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message (optional)</label>
              <textarea className="w-full border rounded p-2" rows={3} value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" loading={submitting}>Submit Quote Request</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GetQuoteModal; 