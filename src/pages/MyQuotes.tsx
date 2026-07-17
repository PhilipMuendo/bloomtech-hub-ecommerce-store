import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { Clock, MailCheck, CheckCircle, XCircle, Send, MessageSquare, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const MyQuotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
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

  // Fetch quotes on mount and when user changes
  useEffect(() => {
    if (!user) {
      setQuotes([]);
      setSelectedQuote(null);
      setLoading(false);
      return;
    }
    
    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/quotes/user', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) {
          if (res.status === 429) {
            setError('Too many requests. Please wait a moment.');
            return;
          }
          throw new Error('Failed to fetch quotes');
        }
        const data = await res.json();
        setQuotes(data);
        
        // If a quote is selected, update it silently
        setSelectedQuote(prev => {
          if (prev && data.find((q: Quote) => q.id === prev.id)) {
            return data.find((q: Quote) => q.id === prev.id);
          }
          return prev;
        });
      } catch (err: any) {
        setError(err.message || 'Error loading quotes');
      } finally {
        setLoading(false);
      }
    };
    
    setLoading(true);
    setError(null);
    fetchQuotes();
    
    // Only refresh every 60 seconds (less aggressive to avoid rate limiting)
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [user]); // Only depend on user to prevent infinite loops

  // Fetch fresh quote details only when quote ID changes (on selection)
  useEffect(() => {
    if (!selectedQuote?.id || !user) return;
    
    const fetchQuoteDetails = async () => {
      try {
        const res = await fetch(`/api/quotes/${selectedQuote.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) {
          const freshQuote = await res.json();
          setSelectedQuote(freshQuote);
          // Also update in quotes list
          setQuotes(prev => prev.map(q => q.id === freshQuote.id ? freshQuote : q));
        }
      } catch (err: any) {
        if (err.message?.includes('429') || err.message?.includes('rate')) {
          console.error('Rate limited - will retry later');
        } else {
          console.error('Failed to fetch quote details:', err);
        }
      }
    };

    // Fetch immediately when quote设计的 selected, then poll every 60 seconds
    fetchQuoteDetails();
    const interval = setInterval(fetchQuoteDetails, 60000);
    return () => clearInterval(interval);
  }, [selectedQuote?.id, user]); // Only depend on ID, not whole object

  const handleReply = async () => {
    if (!selectedQuote) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/quotes/${selectedQuote.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ message: reply }),
      });
      if (!res.ok) throw new Error('Failed to send reply');
      const updatedQuote = await res.json();
      setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
      setSelectedQuote(updatedQuote);
      setReply('');
    } catch (err: any) {
      // toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Bulk Order Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading your quotes...</div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">You have no quote requests yet.</h3>
              <p className="mt-2 text-sm text-muted-foreground">Interested in bulk pricing? Browse our products and request a quote!</p>
              <Button asChild className="mt-6">
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <h2 className="text-lg font-semibold mb-3">All Requests</h2>
                <div className="space-y-2">
                  {quotes.map(q => (
                    <div 
                      key={q.id}
                      className={`p-3 rounded-lg cursor-pointer border ${selectedQuote?.id === q.id ? 'bg-muted border-primary' : 'hover:bg-muted/50'} relative`}
                      onClick={() => setSelectedQuote(q)}
                    >
                      <div className="font-semibold flex items-center gap-2">
                        {q.items?.[0]?.productId?.name || 'Quote Request'}
                        {q.status === 'responded' && !q.userSeen && (
                          <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            !
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</div>
                      <StatusBadge status={q.status} />
                      {q.status === 'responded' && q.messages && q.messages.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {q.messages.filter((m: any) => m.sender === 'admin').length} response(s) from team
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                {selectedQuote ? (
                  <div className="flex flex-col h-full">
                    <div className="mb-4 pb-4 border-b">
                      <h3 className="text-lg font-semibold">{selectedQuote.items?.[0]?.productId?.name || 'Quote Request'}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={selectedQuote.status} />
                        {selectedQuote.status === 'responded' && (
                          <span className="text-sm text-blue-600 font-medium">✓ Team has responded</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-grow space-y-4 overflow-y-auto p-4 border rounded-lg h-96">
                      {selectedQuote.messages && selectedQuote.messages.length > 0 ? (
                        selectedQuote.messages.map((msg: any) => (
                          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md rounded-xl px-4 py-2 ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-blue-50 border border-blue-200'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold">{msg.sender === 'admin' ? 'BLOOMTECH HUB Team' : 'You'}</span>
                              </div>
                              <p className={msg.sender === 'admin' ? 'text-gray-900' : ''}>{msg.text}</p>
                              <p className={`text-xs opacity-70 mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                                {new Date(msg.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No messages yet. Waiting for team response...
                        </div>
                      )}
                    </div>
                    {(selectedQuote.status === 'responded' || selectedQuote.status === 'pending') && (
                      <div className="mt-4 flex gap-2">
                        <textarea 
                          className="w-full rounded-md border p-2 text-sm" 
                          value={reply} 
                          onChange={e => setReply(e.target.value)} 
                          placeholder="Type your reply..."
                        />
                        <Button onClick={handleReply} disabled={replying} size="icon">
                          {replying ? <Clock className="animate-spin" /> : <Send />}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full border rounded-lg bg-muted/50">
                    <div className="text-center">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-semibold">Select a quote</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Choose a quote from the left to see the conversation.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyQuotes;
