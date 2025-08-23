import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Mail, Clock, User, MessageSquare, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read';

  adminNotes?: string;
  respondedBy?: number;
  respondedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

const ContactMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);

      
      const response = await fetch(`/api/contact/messages?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setTotalPages(data.totalPages);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter]);

  const filteredMessages = messages.filter(message => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      message.name.toLowerCase().includes(searchLower) ||
      message.email.toLowerCase().includes(searchLower) ||
      message.subject.toLowerCase().includes(searchLower) ||
      message.message.toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'secondary';
      case 'read': return 'default';
      default: return 'secondary';
    }
  };



  const updateMessageStatus = async (messageId: string, newStatus: string, adminNotes?: string) => {
    try {
      const response = await fetch(`/api/contact/messages/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus, adminNotes })
      });

      if (response.ok) {
        await fetchMessages();
        toast({
          title: "Status Updated",
          description: `Message status changed to ${newStatus}`,
        });
        setSelectedMessage(null);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update message status",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/contact/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        await fetchMessages();
        toast({
          title: "Message Deleted",
          description: "Contact message has been permanently deleted",
          variant: "destructive"
        });
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  if (loading) {
    return <div className="text-center py-12">Loading contact messages...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">Manage customer inquiries and support requests</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter(m => m.status === 'new').length}</div>
          </CardContent>
        </Card>
        
        
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Management</CardTitle>
          <CardDescription>
            {filteredMessages.length} of {messages.length} messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
                             <SelectContent>
                 <SelectItem value="all">All Status</SelectItem>
                 <SelectItem value="new">New</SelectItem>
                 <SelectItem value="read">Read</SelectItem>
               </SelectContent>
            </Select>
            
          </div>

          <div className="overflow-x-auto max-w-full">
            <Table className="min-w-[800px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>

                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{message.name}</div>
                        <div className="text-sm text-muted-foreground">{message.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={message.subject}>
                        {message.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(message.status)}>
                        {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button onClick={handlePrevPage} disabled={page === 1} variant="outline">Previous</Button>
            <span>Page {page} of {totalPages}</span>
            <Button onClick={handleNextPage} disabled={page === totalPages} variant="outline">Next</Button>
          </div>
        </CardContent>
      </Card>

      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Message Details - {selectedMessage.subject}</DialogTitle>
              <DialogDescription>
                Contact form submission from {selectedMessage.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Contact Information</h4>
                  <p><strong>Name:</strong> {selectedMessage.name}</p>
                  <p><strong>Email:</strong> {selectedMessage.email}</p>
                  <p><strong>Subject:</strong> {selectedMessage.subject}</p>
                  <p><strong>Submitted:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Message Status</h4>
                  <p><strong>Status:</strong> <Badge variant={getStatusColor(selectedMessage.status)}>
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </Badge></p>
                  
                  {selectedMessage.respondedAt && (
                    <p><strong>Responded:</strong> {new Date(selectedMessage.respondedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Message Content</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {selectedMessage.adminNotes && (
                <div>
                  <h4 className="font-semibold mb-2">Admin Notes</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.adminNotes}</p>
                  </div>
                </div>
              )}

                             <div className="flex gap-2 pt-4">
                 {selectedMessage.status === 'new' && (
                   <Button
                     onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                   >
                     <CheckCircle className="mr-2 h-4 w-4" />
                     Mark as Read
                   </Button>
                 )}
                 {selectedMessage.status === 'read' && (
                   <Button
                     onClick={() => updateMessageStatus(selectedMessage.id, 'new')}
                   >
                     <Clock className="mr-2 h-4 w-4" />
                     Mark as New
                   </Button>
                 )}
               </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContactMessages;
