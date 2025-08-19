import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useAutoRefreshList, REAL_TIME_EVENTS } from '@/utils/realTimeUpdates';
import { Search, Download, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  orderId: {
    id: string;
  };
  userId?: {
    name: string;
    email: string;
  };
  phoneNumber: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  resultDesc?: string;
  createdAt: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/payments/transactions', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh transactions list when transactions are updated
  useAutoRefreshList(
    fetchTransactions,
    [REAL_TIME_EVENTS.TRANSACTIONS_UPDATED, REAL_TIME_EVENTS.PAYMENTS_UPDATED],
    []
  );

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.phoneNumber.includes(searchTerm) ||
            transaction.orderId.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.mpesaReceiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.userId?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportTransactions = () => {
    // Helper function to escape CSV fields
    const escapeCSV = (field: any) => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    // Helper function to format phone number
    const formatPhoneNumber = (phone: string) => {
      if (!phone) return 'N/A';
      // Convert scientific notation back to readable format
      const num = parseFloat(phone);
      if (isNaN(num)) return phone;
      return num.toString();
    };

    const csvData = filteredTransactions.map(t => ({
      'Transaction ID': t.id,
      'Order ID': t.orderId.id || 'N/A',
      'Customer': t.userId?.name || 'Guest',
      'Email': t.userId?.email || 'N/A',
      'Phone Number': formatPhoneNumber(t.phoneNumber),
      'Amount (KES)': formatAmount(t.amount),
      'Status': t.status,
      'M-Pesa Receipt': t.mpesaReceiptNumber || 'N/A',
      'Transaction Date': t.transactionDate ? formatDate(t.transactionDate) : 'N/A',
      'Created': formatDate(t.createdAt),
      'Description': t.resultDesc || 'N/A'
    }));

    // Create CSV content with proper escaping
    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.map(escapeCSV).join(','),
      ...csvData.map(row => headers.map(header => escapeCSV(row[header as keyof typeof row])).join(','))
    ];

    const csvContent = csvRows.join('\r\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalStats = () => {
    const completed = transactions.filter(t => t.status === 'completed');
    const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
    const todayTransactions = transactions.filter(t => 
      new Date(t.createdAt).toDateString() === new Date().toDateString()
    );

    return {
      totalTransactions: transactions.length,
      completedTransactions: completed.length,
      totalRevenue,
      todayTransactions: todayTransactions.length
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">Monitor M-Pesa payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatAmount(stats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by phone, order ID, receipt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTransactions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>M-Pesa Receipt</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-xs">
                      {transaction.orderId.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.userId?.name || 'Guest User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.userId?.email || 'No email'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {transaction.phoneNumber}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {transaction.mpesaReceiptNumber || '-'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {transaction.transactionDate 
                        ? formatDate(transaction.transactionDate)
                        : formatDate(transaction.createdAt)
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;