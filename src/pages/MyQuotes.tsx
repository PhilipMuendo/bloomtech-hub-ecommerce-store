import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { Clock, MailCheck, CheckCircle, XCircle } from 'lucide-react';

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
    default:
      return status;
  }
};

const MyQuotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  // Clear notifications in header when visiting this page
  useEffect(() => {
    const markSeen = async () => {
      if (!user) return;
      await fetch('/api/quotes/mark-seen', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user.token}` },
      });
    };
    markSeen();
  }, [user]);

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/quotes/user', {
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

  const handleReply = async () => {
    if (!selectedQuote) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/quotes/${selectedQuote._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ message: reply }),
      });
      if (!res.ok) throw new Error('Failed to send reply');
      const updatedQuote = await res.json();
      setQuotes(prev => prev.map(q => q._id === updatedQuote._id ? updatedQuote : q));
      setSelectedQuote(null);
      setReply('');
    } catch (err: any) {
      // toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>My Bulk Order Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : quotes.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No quote requests found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Response</TableHead>
                  <TableHead>Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow key={q._id}>
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
                    <TableCell>
                      {q.adminResponse ? (
                        <span className="block text-green-700 bg-green-50 rounded px-2 py-1 text-xs">{q.adminResponse}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No response yet</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(q.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => setSelectedQuote(q)}>View & Reply</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add a dialog for viewing conversation and replying */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quote Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedQuote?.messages.map((msg: any) => (
              <div key={msg._id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <p>{msg.text}</p>
                  <p className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          {(selectedQuote?.status === 'responded' || selectedQuote?.status === 'pending') && (
            <div className="mt-4">
              <textarea className="w-full border rounded p-2" value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..."></textarea>
              <Button onClick={handleReply} loading={replying} className="mt-2">Send Reply</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyQuotes; 