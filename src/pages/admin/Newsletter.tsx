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
  name?: string;
  subscribeDate: string;
  status: 'active' | 'unsubscribed';
  source: 'website' | 'manual' | 'import';
}

interface Campaign {
  id: string;
  subject: string;
  content: string;
  sentDate: string;
  recipients: number;
  openRate: number;
  clickRate: number;
  _id?: string; // Added for backend compatibility
}

// Utility function to convert subscribers to CSV
function subscribersToCSV(subscribers: Subscriber[]): string {
  const header = ['ID', 'Email', 'Name', 'Subscribe Date', 'Status', 'Source'];
  const rows = subscribers.map(s => [
    s.id,
    s.email,
    s.name || '',
    s.subscribeDate,
    s.status,
    s.source
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
      const res = await fetch('/api/subscribers', {
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

  const activeSubscribers = subscribersState.filter(s => s.status === 'active');
  const filteredSubscribers = subscribersState.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
      Name: s.name || '',
      'Subscribe Date': s.subscribeDate,
      Status: s.status,
      Source: s.source
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subscribers');
    XLSX.writeFile(wb, 'subscribers.xlsx');
  };

  const handleRemoveSubscriber = (subscriberId: string) => {
    if (window.confirm('Are you sure you want to remove this subscriber?')) {
      setSubscribersState(prev => prev.filter(s => s.id !== subscriberId));
      toast({
        title: "Subscriber Removed",
        description: "Subscriber has been removed from the newsletter",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground">Manage subscribers and email campaigns</p>
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

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Subscribe Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.name || '-'}</TableCell>
                      <TableCell>{new Date(subscriber.subscribeDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                          {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subscriber.source.charAt(0).toUpperCase() + subscriber.source.slice(1)}
                        </Badge>
                      </TableCell>
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
                      <TableRow key={c._id || c.id}>
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