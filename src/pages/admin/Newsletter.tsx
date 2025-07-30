import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Send, Users, TrendingUp, Search, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/AuthContext';

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface Campaign {
  id: string;
  subject: string;
  content: string;
  sentDate: string;
  recipients: string[];
  createdAt: string;
  updatedAt: string;
}

// Utility function to convert subscribers to CSV
function subscribersToCSV(subscribers: Subscriber[]): string {
  const header = ['ID', 'Email', 'Subscribe Date'];
  const rows = subscribers.map(s => [
    s.id,
    s.email,
    s.createdAt
  ]);
  return [header, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\r\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const Newsletter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [newCampaign, setNewCampaign] = useState({
    subject: '',
    content: ''
  });

  const [subscribersState, setSubscribersState] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscribersError, setSubscribersError] = useState<string | null>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  // Fetch subscribers from backend
  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    setSubscribersError(null);
    try {
      const res = await fetch('/api/newsletter/subscribers', {
        headers: { Authorization: `Bearer ${currentUser?.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      const data = await res.json();
      setSubscribersState(data);
    } catch (err: any) {
      setSubscribersError(err.message);
    } finally {
      setSubscribersLoading(false);
    }
  };
  useEffect(() => { fetchSubscribers(); /* eslint-disable-line */ }, []);

  // Fetch campaigns from backend
  const fetchCampaigns = async () => {
    setCampaignsLoading(true);
    setCampaignsError(null);
    try {
      const res = await fetch('/api/campaigns', {
        headers: { Authorization: `Bearer ${currentUser?.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch (err: any) {
      setCampaignsError(err.message);
    } finally {
      setCampaignsLoading(false);
    }
  };
  useEffect(() => { fetchCampaigns(); /* eslint-disable-line */ }, []);

  const activeSubscribers = subscribersState; // All subscribers are active in this model
  const filteredSubscribers = subscribersState.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendCampaign = async () => {
    if (!newCampaign.subject || !newCampaign.content) {
      toast({ title: 'Error', description: 'Subject and content are required.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({ subject: newCampaign.subject, content: newCampaign.content })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send campaign');
      }
      toast({ title: 'Campaign Sent', description: `Newsletter "${newCampaign.subject}" sent successfully.` });
      setIsComposeOpen(false);
      setNewCampaign({ subject: '', content: '' });
      fetchCampaigns();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredSubscribers.map(s => ({
      ID: s.id,
      Email: s.email,
      'Subscribe Date': s.createdAt
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subscribers');
    XLSX.writeFile(wb, 'subscribers.xlsx');
  };

  const handleRemoveSubscriber = async (subscriberId: string) => {
    if (window.confirm('Are you sure you want to remove this subscriber?')) {
      try {
        const res = await fetch(`/api/newsletter/subscribers/${subscriberId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${currentUser?.token}` }
        });
        if (!res.ok) throw new Error('Failed to remove subscriber');
        
        setSubscribersState(prev => prev.filter(s => s.id !== subscriberId));
        toast({
          title: "Subscriber Removed",
          description: "Subscriber has been removed from the newsletter"
        });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage subscribers and email campaigns</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Compose Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Newsletter Campaign</DialogTitle>
              <DialogDescription>
                Send a newsletter to all active subscribers ({activeSubscribers.length} recipients)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                  placeholder="Write your newsletter content..."
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendCampaign}>
                <Send className="mr-2 h-4 w-4" />
                Send to {activeSubscribers.length} Subscribers
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribersState.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Active Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4" />
              Campaigns Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'subscribers' ? 'default' : 'outline'}
              onClick={() => setActiveTab('subscribers')}
            >
              Subscribers
            </Button>
            <Button
              variant={activeTab === 'campaigns' ? 'default' : 'outline'}
              onClick={() => setActiveTab('campaigns')}
            >
              Campaigns
            </Button>
          </div>
          {activeTab === 'subscribers' && (
            <Button
              variant="outline"
              onClick={handleExportExcel}
            >
              Export to Excel
            </Button>
          )}
        </div>

        {activeTab === 'subscribers' && (
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Management</CardTitle>
              <CardDescription>
                {filteredSubscribers.length} of {subscribersState.length} subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscribe Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{new Date(subscriber.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveSubscriber(subscriber.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'campaigns' && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
              <CardDescription>
                Previous newsletter campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div>Loading campaigns...</div>
              ) : campaignsError ? (
                <div className="text-red-500">{campaignsError}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Recipients</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.subject}</TableCell>
                        <TableCell>{new Date(c.sentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{c.recipients.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Newsletter;