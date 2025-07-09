import React, { useState } from 'react';
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

  const [newCampaign, setNewCampaign] = useState({
    subject: '',
    content: ''
  });

  // Mock subscribers data
  const subscribers: Subscriber[] = [
    {
      id: 'SUB-001',
      email: 'john@example.com',
      name: 'John Doe',
      subscribeDate: '2024-01-15',
      status: 'active',
      source: 'website'
    },
    {
      id: 'SUB-002',
      email: 'jane@example.com',
      name: 'Jane Smith',
      subscribeDate: '2024-01-14',
      status: 'active',
      source: 'website'
    },
    {
      id: 'SUB-003',
      email: 'mike@example.com',
      subscribeDate: '2024-01-13',
      status: 'unsubscribed',
      source: 'manual'
    },
    {
      id: 'SUB-004',
      email: 'sarah@example.com',
      name: 'Sarah Wilson',
      subscribeDate: '2024-01-12',
      status: 'active',
      source: 'website'
    },
    {
      id: 'SUB-005',
      email: 'david@example.com',
      subscribeDate: '2024-01-11',
      status: 'active',
      source: 'import'
    }
  ];

  // Mock campaigns data
  const campaigns: Campaign[] = [
    {
      id: 'CAM-001',
      subject: 'New ICT Equipment Arrivals - January 2024',
      content: 'Check out our latest collection of laptops and networking equipment...',
      sentDate: '2024-01-15',
      recipients: 234,
      openRate: 24.5,
      clickRate: 3.2
    },
    {
      id: 'CAM-002',
      subject: 'Electrical Materials Sale - 20% Off',
      content: 'Limited time offer on all electrical components and tools...',
      sentDate: '2024-01-10',
      recipients: 221,
      openRate: 31.2,
      clickRate: 5.8
    },
    {
      id: 'CAM-003',
      subject: 'BLOOMTECH Hub Newsletter - December 2023',
      content: 'Year-end recap and upcoming product launches...',
      sentDate: '2023-12-30',
      recipients: 198,
      openRate: 18.7,
      clickRate: 2.1
    }
  ];

  const [subscribersState, setSubscribersState] = useState<Subscriber[]>(subscribers);

  const activeSubscribers = subscribersState.filter(s => s.status === 'active');
  const filteredSubscribers = subscribersState.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSendCampaign = () => {
    // In real app, would call API
    toast({
      title: "Campaign Sent",
      description: `Newsletter "${newCampaign.subject}" sent to ${activeSubscribers.length} subscribers`,
    });
    setIsComposeOpen(false);
    setNewCampaign({ subject: '', content: '' });
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length).toFixed(1)}%
            </div>
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
                Previous newsletter campaigns and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Click Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.content.substring(0, 50)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(campaign.sentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{campaign.recipients}</TableCell>
                      <TableCell>
                        <Badge variant={campaign.openRate > 25 ? 'default' : 'secondary'}>
                          {campaign.openRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={campaign.clickRate > 3 ? 'default' : 'secondary'}>
                          {campaign.clickRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Newsletter;