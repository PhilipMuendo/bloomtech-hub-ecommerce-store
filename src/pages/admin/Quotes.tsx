import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, MailCheck, CheckCircle, XCircle, FilePlus, User as UserIcon } from 'lucide-react';
import { Quote } from '@/types';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded bg-yellow-100 text-yellow-800 text-sm font-semibold">
          <Clock className="w-5 h-5" /> Pending
        </span>
      );
    case 'responded':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-100 text-blue-800 text-sm font-semibold">
          <MailCheck className="w-5 h-5" /> Responded
        </span>
      );
    case 'closed':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-200 text-gray-800 text-sm font-semibold">
          <CheckCircle className="w-5 h-5" /> Closed
        </span>
      );
    case 'declined':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-100 text-red-800 text-sm font-semibold">
          <XCircle className="w-5 h-5" /> Declined
        </span>
      );
    default:
      return status;
  }
};

const Quotes = () => {
  const [dateFilterType, setDateFilterType] = useState<'range' | 'day' | ''>('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'status' | 'name'>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('responded');
  const [responding, setResponding] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [showRespondDialog, setShowRespondDialog] = useState(false);
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
      setShowRespondDialog(false);
      setResponse('');
      setStatus('responded');
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
    if (selectedQuote.orderCreated) {
      toast({ title: 'Error', description: 'Order has already been created for this quote', variant: 'destructive' });
      return;
    }
    setCreatingOrder(true);
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
      const updatedQuote = { 
        ...selectedQuote, 
        status: 'closed' as const, 
        orderCreated: true 
      };
      setQuotes((prev) => prev.map((q) => (q._id === updatedQuote._id ? updatedQuote : q)));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setCreatingOrder(false);
    }
  };

  // Sort quotes first
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Then filter by date
  let filteredQuotes = sortedQuotes;
  if (dateFilterType === 'range' && filterStart && filterEnd) {
    const start = new Date(filterStart).setHours(0,0,0,0);
    const end = new Date(filterEnd).setHours(23,59,59,999);
    filteredQuotes = sortedQuotes.filter(q => {
      const created = new Date(q.createdAt).getTime();
      return created >= start && created <= end;
    });
  } else if (dateFilterType === 'day' && filterDay) {
    const dayStart = new Date(filterDay).setHours(0,0,0,0);
    const dayEnd = new Date(filterDay).setHours(23,59,59,999);
    filteredQuotes = sortedQuotes.filter(q => {
      const created = new Date(q.createdAt).getTime();
      return created >= dayStart && created <= dayEnd;
    });
  }

  return (
    <Card className="max-w-full">
      <CardHeader>
        <CardTitle>Quote Requests</CardTitle>
        <div className="mt-2 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 items-center">
            <label htmlFor="sortQuotes" className="text-sm font-medium">Sort by:</label>
            <select
              id="sortQuotes"
              className="border rounded px-2 py-1 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'status' | 'name')}
            >
              <option value="newest">Newest First</option>
              <option value="status">Status</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="dateFilterType" className="text-sm font-medium">Filter by date:</label>
            <select
              id="dateFilterType"
              className="border rounded px-2 py-1 text-sm"
              value={dateFilterType}
              onChange={e => setDateFilterType(e.target.value as 'range' | 'day' | '')}
            >
              <option value="">None</option>
              <option value="range">Date Range</option>
              <option value="day">Specific Day</option>
            </select>
          </div>
          {dateFilterType === 'range' && (
            <div className="flex gap-2 items-center">
              <label className="text-sm">From:</label>
              <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="border rounded px-2 py-1 text-sm" />
              <label className="text-sm">To:</label>
              <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="border rounded px-2 py-1 text-sm" />
            </div>
          )}
          {dateFilterType === 'day' && (
            <div className="flex gap-2 items-center">
              <label className="text-sm">Day:</label>
              <input type="date" value={filterDay} onChange={e => setFilterDay(e.target.value)} className="border rounded px-2 py-1 text-sm" />
            </div>
          )}
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
              {filteredQuotes.map((q) => (
                <TableRow 
                  key={q._id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedQuote(q);
                    setShowQuoteDetails(true);
                  }}
                >
                  <TableCell>{q.name}</TableCell>
                  <TableCell>{q.email}</TableCell>
                  <TableCell>
                    {q.items?.map((item: any) => (
                      <div key={item._id || item.productId?._id || item.productId}>
                        {item.productId?.name || item.productId} x {item.quantity}
                      </div>
                    )) || 'No items'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} />
                  </TableCell>
                  <TableCell>{new Date(q.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {(q.status === 'pending' || q.status === 'responded') && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuote(q);
                          setResponse(q.adminResponse || '');
                          setStatus(q.status || 'responded');
                          setShowRespondDialog(true);
                        }}
                      >
                        Respond
                      </Button>
                    )}
                    {q.status === 'closed' && !q.orderCreated && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuote(q);
                          setShowCreateOrder(true);
                          setShowRespondDialog(false); // Ensure respond dialog doesn't open
                        }}
                      >
                        <FilePlus className="w-4 h-4 mr-1" /> Create Order
                      </Button>
                    )}
                    {q.status === 'closed' && q.orderCreated && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" /> Order Created
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Dialog open={showRespondDialog} onOpenChange={setShowRespondDialog}>
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
                  {selectedQuote.messages?.map((msg: any) => (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2 text-sm ${
                        msg.sender === 'admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-xl px-3 py-2 ${
                          msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Your Response</h3>
                <textarea
                  className="w-full min-h-[80px] rounded-md border p-2 text-sm"
                  placeholder="Type your response or decline reason..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Update Status</h3>
                <select
                  className="w-full rounded-md border p-2 text-sm bg-background"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
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
      
      {/* Quote Details Dialog */}
      <Dialog open={showQuoteDetails} onOpenChange={setShowQuoteDetails}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold">Quote Details</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-8">
              {/* Customer Information */}
              <div className="flex items-start gap-4 rounded-lg border bg-muted/50 p-6">
                <UserIcon className="h-8 w-8 text-muted-foreground mt-1" />
                <div className="space-y-2">
                  <div className="font-semibold text-xl">{selectedQuote.name}</div>
                  <div className="text-base text-muted-foreground">{selectedQuote.email}</div>
                  {selectedQuote.phone && (
                    <div className="text-base text-muted-foreground">Phone: {selectedQuote.phone}</div>
                  )}
                  <div className="text-base text-muted-foreground">
                    Requested: {new Date(selectedQuote.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Quote Items */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Requested Items</h3>
                <div className="space-y-3">
                  {selectedQuote.items?.map((item: any, index: number) => (
                    <div key={item._id || index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                      <div className="space-y-1">
                        <p className="font-medium text-lg">{item.productId?.name || `Product ${item.productId}`}</p>
                        <p className="text-base text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium text-lg">KES {(item.productId?.price * item.quantity)?.toLocaleString() || 'N/A'}</p>
                        <p className="text-base text-muted-foreground">KES {item.productId?.price?.toLocaleString() || 'N/A'} each</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-8 text-lg">No items found</div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Status</h3>
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedQuote.status} />
                  {selectedQuote.orderCreated && (
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded bg-green-100 text-green-800 text-sm font-semibold">
                      <CheckCircle className="w-5 h-5" /> Order Created
                    </span>
                  )}
                </div>
              </div>

              {/* Final Agreed Price */}
              {selectedQuote.orderCreated && selectedQuote.finalPrice && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">Final Agreed Price</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-green-800">Agreed Amount:</span>
                      <span className="text-2xl font-bold text-green-800">
                        KES {selectedQuote.finalPrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      This amount was sent to the customer via email for payment.
                    </p>
                  </div>
                </div>
              )}

              {/* Conversation History */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Conversation History</h3>
                <div className="max-h-80 space-y-4 overflow-y-auto rounded-lg border p-6 bg-gray-50">
                  {selectedQuote.messages?.length > 0 ? (
                    selectedQuote.messages.map((msg: any) => (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-3 ${
                          msg.sender === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-md rounded-xl px-4 py-3 ${
                            msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-white border'
                          }`}
                        >
                          <p className="text-base">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-2 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8 text-lg">No messages yet</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                {(selectedQuote.status === 'pending' || selectedQuote.status === 'responded') && (
                  <Button
                    onClick={() => {
                      setShowQuoteDetails(false);
                      setResponse(selectedQuote.adminResponse || '');
                      setStatus(selectedQuote.status || 'responded');
                      setShowRespondDialog(true);
                    }}
                    className="flex-1 py-3 text-base"
                  >
                    Respond to Quote
                  </Button>
                )}
                {selectedQuote.status === 'closed' && !selectedQuote.orderCreated && (
                  <Button
                    onClick={() => {
                      setShowQuoteDetails(false);
                      setShowCreateOrder(true);
                      setShowRespondDialog(false);
                    }}
                    variant="outline"
                    className="flex-1 py-3 text-base"
                  >
                    <FilePlus className="w-5 h-5 mr-2" /> Create Order
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowQuoteDetails(false)}
                  size="sm"
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create Order Dialog */}
      <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Order from Quote</DialogTitle>
          </DialogHeader>
          {selectedQuote?.orderCreated ? (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  <strong>Note:</strong> An order has already been created for this quote.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label>Final Price (KES)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={finalPrice}
                onChange={(e) => setFinalPrice(Number(e.target.value))}
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCreateOrder} disabled={creatingOrder || selectedQuote?.orderCreated}>
              {creatingOrder ? <Clock className="animate-spin" /> : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Quotes;
