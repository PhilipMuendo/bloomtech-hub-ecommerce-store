import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Download, Eye, Calendar, User, Activity, Zap, Database, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface AuditLog {
  id: number;
  performedBy: number;
  performedByRole: string;
  performedByName: string;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  previousValues: any;
  newValues: any;
  ipAddress: string;
  userAgent: string;
  status: string;
  context: any;
  createdAt: string;
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: number; userName: string; count: number }>;
}

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchAuditLogs();
    fetchAuditStats();
  }, [page, searchTerm, entityTypeFilter, actionFilter, statusFilter, dateRange]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (entityTypeFilter !== 'all') params.append('entityType', entityTypeFilter);
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        params.append('startDate', startDate.toISOString());
        params.append('endDate', now.toISOString());
      }

      const response = await fetch(`/api/audit/logs?${params}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      } else {
        setError('Failed to fetch audit logs');
        toast({
          title: "Error",
          description: "Failed to fetch audit logs",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError('Failed to fetch audit logs');
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const response = await fetch('/api/audit/stats', {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (entityTypeFilter !== 'all') params.append('entityType', entityTypeFilter);
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/audit/export?${params}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-logs.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Audit logs exported successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to export audit logs",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export audit logs",
        variant: "destructive",
      });
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'default';
    if (action.includes('updated')) return 'secondary';
    if (action.includes('deleted')) return 'destructive';
    if (action.includes('status')) return 'outline';
    return 'default';
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'order': return 'default';
      case 'quote': return 'secondary';
      case 'user': return 'outline';
      case 'product': return 'destructive';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionDisplayName = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderFormattedValues = (values: any) => {
    if (!values) return <span className="text-muted-foreground">No data</span>;
    
    const formatValue = (key: string, value: any) => {
      if (value === null || value === undefined) return null;
      
      let displayValue = value;
      if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      } else if (typeof value === 'number') {
        displayValue = value.toLocaleString();
      } else if (typeof value === 'string' && value.length > 100) {
        displayValue = value.substring(0, 100) + '...';
      }
      
      return (
        <div key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
          <span className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
          <span className="text-sm text-muted-foreground max-w-xs truncate" title={String(value)}>
            {displayValue}
          </span>
        </div>
      );
    };

    if (typeof values === 'object' && values !== null) {
      const entries = Object.entries(values).filter(([_, value]) => value !== null && value !== undefined);
      
      if (entries.length === 0) {
        return <span className="text-muted-foreground">No data available</span>;
      }

      return (
        <div className="space-y-1">
          {entries.map(([key, value]) => formatValue(key, value))}
        </div>
      );
    }

    return <span className="text-sm">{String(values)}</span>;
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">System activity and user actions</p>
        </div>
        <div className="flex justify-center items-center h-40">
          <span>Loading audit logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">System activity and user actions</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayLogs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeekLogs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonthLogs}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            {logs.length} of {totalPages * 50} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="order">Orders</SelectItem>
                <SelectItem value="quote">Quotes</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="product">Products</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="status">Status Changed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportAuditLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.performedByName}</div>
                          <div className="text-sm text-muted-foreground">{log.performedByRole}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(log.action)}>
                          {getActionDisplayName(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getEntityTypeColor(log.entityType)}>
                            {log.entityType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{log.entityId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={log.details}>
                          {log.details}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(log.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Audit Log Details
              </DialogTitle>
              <DialogDescription>
                Detailed information about this system action
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Summary Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Performed By</span>
                      </div>
                      <p className="text-sm">{selectedLog.performedByName}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedLog.performedByRole} (ID: {selectedLog.performedBy})
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Action</span>
                      </div>
                      <Badge variant="outline" className={getActionColor(selectedLog.action)}>
                        {getActionDisplayName(selectedLog.action)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Entity</span>
                      </div>
                      <Badge variant="outline" className={getEntityTypeColor(selectedLog.entityType)}>
                        {selectedLog.entityType} #{selectedLog.entityId}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedLog.details}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Changes Section */}
              {(selectedLog.previousValues || selectedLog.newValues) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Changes</CardTitle>
                    <CardDescription>
                      {selectedLog.previousValues && selectedLog.newValues 
                        ? 'Before and after values for this action'
                        : selectedLog.previousValues 
                        ? 'Previous values before deletion'
                        : 'New values after creation'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {selectedLog.previousValues && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4 text-red-500" />
                            Previous Values
                          </h4>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                            {renderFormattedValues(selectedLog.previousValues)}
                          </div>
                        </div>
                      )}
                      
                      {selectedLog.newValues && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-green-500" />
                            New Values
                          </h4>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                            {renderFormattedValues(selectedLog.newValues)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technical Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Status</span>
                        <Badge 
                          variant={selectedLog.status === 'success' ? 'default' : 'destructive'}
                          className="ml-2"
                        >
                          {selectedLog.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Timestamp</span>
                        <p className="text-sm text-muted-foreground">{formatDate(selectedLog.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">IP Address</span>
                        <p className="text-sm text-muted-foreground font-mono">{selectedLog.ipAddress || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">User Agent</span>
                      <p className="text-sm text-muted-foreground font-mono break-all">
                        {selectedLog.userAgent || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedLog.context && (
                    <div className="mt-4">
                      <span className="text-sm font-medium">Additional Context</span>
                      <div className="bg-muted rounded-lg p-3 mt-1 max-h-32 overflow-y-auto">
                        <pre className="text-xs">{JSON.stringify(selectedLog.context, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AuditLogs; 