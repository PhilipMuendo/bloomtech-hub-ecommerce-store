import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Filter,
  Phone,
  CreditCard,
  Calendar,
  DollarSign,
  Globe
} from 'lucide-react';

interface Transaction {
  id: number;
  orderId: number;
  userId: number;
  phoneNumber: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  checkoutRequestId: string;
  resultDesc?: string;
  transactionDate?: string;
  createdAt: string;
  Order?: {
    id: number;
    total: number;
    status: string;
  };
}

const PesapalTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is superadmin
  if (!user || user.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Globe className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You don't have permission to view Pesapal transactions. 
                Only superadmin users can access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchTransactions = async () => {
    try {
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching Pesapal transactions...', { userRole: user.role });

      const response = await fetch('/api/payments/pesapal/transactions', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          setTransactions(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch transactions');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch transactions`);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch transactions",
        variant: "destructive"
      });
      setTransactions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      (transaction.phoneNumber && transaction.phoneNumber.toLowerCase().includes(searchLower)) ||
      (transaction.transactionId && transaction.transactionId.toLowerCase().includes(searchLower)) ||
      (transaction.checkoutRequestId && transaction.checkoutRequestId.toLowerCase().includes(searchLower)) ||
      (transaction.orderId && transaction.orderId.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case 'unknown':
        return <Badge className="bg-gray-100 text-gray-600">Unknown</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE');
  };

  const exportTransactions = () => {
    const csvContent = [
      ['ID', 'Order ID', 'Phone Number', 'Amount', 'Status', 'Transaction ID', 'Date', 'Result Description'],
      ...filteredTransactions.map(t => [
        t?.id || 'N/A',
        t?.orderId || 'N/A',
        t?.phoneNumber || 'N/A',
        t?.amount ? formatAmount(t.amount) : 'N/A',
        t?.status || 'N/A',
        t?.transactionId || 'N/A',
        t?.createdAt ? formatDate(t.createdAt) : 'N/A',
        t?.resultDesc || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesapal-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    if (!Array.isArray(transactions)) {
      return { total: 0, completed: 0, pending: 0, failed: 0, totalAmount: 0 };
    }
    
    const total = transactions.length;
    const completed = transactions.filter(t => t && t.status === 'completed').length;
    const pending = transactions.filter(t => t && t.status === 'pending').length;
    const failed = transactions.filter(t => t && t.status === 'failed').length;
    const totalAmount = transactions
      .filter(t => t && t.status === 'completed' && typeof t.amount === 'number')
      .reduce((sum, t) => sum + t.amount, 0);

    return { total, completed, pending, failed, totalAmount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button onClick={fetchTransactions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportTransactions} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(stats.totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by phone, transaction ID, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Transaction ID</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id || `transaction-${Math.random()}`} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{transaction.id || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium">#{transaction.orderId || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {transaction.phoneNumber && transaction.phoneNumber !== '254700000000' ? transaction.phoneNumber : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {transaction.amount ? formatAmount(transaction.amount) : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status || 'unknown')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate" title={transaction.transactionId || 'N/A'}>
                          {transaction.transactionId || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {transaction.createdAt ? formatDate(transaction.createdAt) : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate" title={transaction.resultDesc || 'N/A'}>
                          {transaction.resultDesc || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PesapalTransactions; 