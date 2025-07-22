import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, MailCheck, CheckCircle, XCircle, FilePlus, User as UserIcon, MessageSquare as MessageIcon } from 'lucide-react';
import { Quote } from '@/types';

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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sortBy, setSortBy] = useState<'status' | 'requested'>('requested');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
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

  useEffect(() => {
    const markAdminSeen = async () => {
      if (user?.role !== 'superadmin') return;
      try {
        await fetch('/api/quotes/admin-seen', {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${user.token}` },
        });
      } catch (error) {
        console.error("Failed to mark quotes as seen:", error);
      }
    };
    markAdminSeen();
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

  // Sorting logic
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (sortBy === 'status') {
      const statusOrder = { pending: 1, responded: 2, closed: 3, declined: 4 };
      const aStatus = statusOrder[a.status] || 99;
      const bStatus = statusOrder[b.status] || 99;
      return sortOrder === 'asc' ? aStatus - bStatus : bStatus - aStatus;
    } else {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    }
  });

  return (
    <Card className="max-w-full">
      <CardHeader>
        <CardTitle>Quote Requests</CardTitle>
        <div className="flex gap-2 mt-2">
          <label className="text-sm font-medium">Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
            <option value="requested">Requested Date</option>
            <option value="status">Status</option>
          </select>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
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
              {sortedQuotes.map((q) => (
                <TableRow key={q._id} className={q.status === 'closed' ? 'bg-gray-50' : q.status === 'declined' ? 'bg-red-50' : ''}>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Respond to Quote</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-semibold">{selectedQuote.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedQuote.email}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Conversation History</h3>
                <div className="max-h-48 space-y-3 overflow-y-auto rounded-lg border p-3">
                  {selectedQuote.messages.map((msg: any) => (
                    <div key={msg._id} className={`flex items-end gap-2 text-sm ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-xl px-3 py-2 ${msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Your Response</h3>
                <textarea
                  className="w-full min-h-[80px] rounded-md border p-2 text-sm"
                  placeholder="Type your response or decline reason..."
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Update Status</h3>
                <select className="w-full rounded-md border p-2 text-sm bg-background" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleRespond} disabled={responding}>
              {responding ? <Clock className="animate-spin" /> : 'Send Response'}
            </Button>
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