import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, MailCheck, CheckCircle, XCircle, FilePlus } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">
          <Clock className="w-4 h-4" /> Pending
        </span>
      );
    case 'responded':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
          <MailCheck className="w-4 h-4" /> Responded
        </span>
      );
    case 'closed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" /> Closed
        </span>
      );
    case 'declined':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold">
          <XCircle className="w-4 h-4" /> Declined
        </span>
      );
    default:
      return status;
  }
};

const Quotes = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('responded');
  const [responding, setResponding] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/quotes', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch quotes');
        const data = await res.json();
        setQuotes(data);
      } catch (err: any) {
        setError(err.message || 'Error loading quotes');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchQuotes();
  }, [user]);

  const handleRespond = async () => {
    if (!selectedQuote) return;
    setResponding(true);
    try {
      const res = await fetch(`/api/quotes/${selectedQuote._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ adminResponse: response, status }),
      });
      if (!res.ok) throw new Error('Failed to update quote');
      toast({ title: 'Quote updated' });
      setSelectedQuote(null);
      setResponse('');
      setStatus('responded');
      // Refresh quotes
      const updated = await res.json();
      setQuotes((prev) => prev.map((q) => (q._id === updated._id ? updated : q)));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setResponding(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedQuote) return;
    try {
      const res = await fetch(`/api/quotes/${selectedQuote._id}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ finalPrice }),
      });
      if (!res.ok) throw new Error('Failed to create order');
      toast({ title: 'Order created successfully' });
      setShowCreateOrder(false);
      // Refresh quotes
      const updatedQuote = { ...selectedQuote, status: 'closed' };
      setQuotes(prev => prev.map(q => q._id === updatedQuote._id ? updatedQuote : q));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Card className="max-w-full">
      <CardHeader>
        <CardTitle>Quote Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q._id}>
                  <TableCell>{q.name}</TableCell>
                  <TableCell>{q.email}</TableCell>
                  <TableCell>
                    {q.items.map((item: any) => (
                      <div key={item.productId?._id || item.productId}>
                        {item.productId?.name || item.productId} x {item.quantity}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} />
                  </TableCell>
                  <TableCell>{new Date(q.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {(q.status === 'pending' || q.status === 'responded') && (
                      <Button size="sm" onClick={() => { setSelectedQuote(q); setResponse(q.adminResponse || ''); setStatus(q.status || 'responded'); }}>Respond</Button>
                    )}
                    {q.status === 'closed' && (
                      <Button size="sm" variant="outline" className="ml-2" onClick={() => { setSelectedQuote(q); setShowCreateOrder(true); }}>
                        <FilePlus className="w-4 h-4 mr-1" /> Create Order
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Quote</DialogTitle>
          </DialogHeader>
          <div>
            <div className="mb-2 font-semibold">Customer: {selectedQuote?.name} ({selectedQuote?.email})</div>
            <div className="mb-2">Items:
              <ul className="list-disc ml-5">
                {selectedQuote?.items?.map((item: any) => (
                  <li key={item.productId?._id || item.productId}>
                    {item.productId?.name || item.productId} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-2">Message: {selectedQuote?.message || <span className="italic text-muted-foreground">(none)</span>}</div>
            <div className="mb-2">Conversation:
              <div className="border rounded p-2 max-h-48 overflow-y-auto">
                {selectedQuote?.messages.map((msg: any) => (
                  <div key={msg._id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2 rounded-lg my-1 ${msg.sender === 'admin' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <p>{msg.text}</p>
                      <p className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <textarea
              className="w-full border rounded p-2 mb-2"
              rows={3}
              placeholder="Response to customer..."
              value={response}
              onChange={e => setResponse(e.target.value)}
            />
            <select className="w-full border rounded p-2 mb-2" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="responded">Responded</option>
              <option value="closed">Closed</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          <DialogFooter>
            <Button onClick={handleRespond} loading={responding}>Send Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Order from Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label>Final Price (KES)</label>
            <input type="number" className="w-full border rounded p-2" value={finalPrice} onChange={e => setFinalPrice(Number(e.target.value))} />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateOrder}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Quotes; 