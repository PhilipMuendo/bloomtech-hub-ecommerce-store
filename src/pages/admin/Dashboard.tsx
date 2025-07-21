import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Package, ShoppingCart, Users, MessageSquare, Mail, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { products } from '@/data/products';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const categoryDisplayMap: Record<string, string> = {
  power: 'Power Solutions',
  security: 'Security Systems',
  ict: 'ICT Equipment',
  electrical: 'Electrical Materials',
};
const categoryColors: Record<string, string> = {
  power: '#1E40AF', // blue-800
  security: '#059669', // emerald-600
  ict: '#D97706', // amber-600
  electrical: '#DC2626', // red-600
};

// Custom tooltip for pie chart
const OrdersByCategoryTooltip = ({ active, payload, totalOrders }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    const displayName = categoryDisplayMap[entry.category] || entry.category;
    const percent = totalOrders > 0 ? ((entry.orders / totalOrders) * 100).toFixed(1) : '0';
    return (
      <div className="bg-white p-3 rounded shadow text-sm border">
        <div><strong>{displayName}</strong></div>
        <div>Orders: {entry.orders} ({percent}%)</div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersByCategoryData, setOrdersByCategoryData] = useState([]);
  const [userSignupsData, setUserSignupsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();

  // Add state for recent orders
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);
  const [recentOrdersError, setRecentOrdersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('jwt');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        };
        const fetchOptions = { method: 'GET', headers };
        console.log('Fetch options:', fetchOptions);
        const [summaryRes, revenueRes, ordersCatRes, signupsRes] = await Promise.all([
          fetch('/api/dashboard/summary', fetchOptions),
          fetch('/api/dashboard/revenue-trend', fetchOptions),
          fetch('/api/dashboard/orders-by-category', fetchOptions),
          fetch('/api/dashboard/user-signups', fetchOptions),
        ]);
        if (!summaryRes.ok || !revenueRes.ok || !ordersCatRes.ok || !signupsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const summary = await summaryRes.json();
        const revenue = await revenueRes.json();
        const ordersCat = await ordersCatRes.json();
        const signups = await signupsRes.json();
        setStats(summary);
        setRevenueData(revenue);
        setOrdersByCategoryData(
          ordersCat.map((cat, i) => ({
            ...cat,
            fill: [
              'hsl(var(--primary))',
              'hsl(var(--secondary))',
              'hsl(var(--accent))',
              'hsl(var(--muted))',
              'hsl(var(--orange-500))',
              'hsl(var(--emerald-500))',
            ][i % 6],
          }))
        );
        setUserSignupsData(signups);
      } catch (err) {
        setError(err.message || 'Error loading dashboard');
        toast({ title: 'Error', description: err.message || 'Error loading dashboard', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  // Fetch recent orders (most recent 4)
  useEffect(() => {
    const fetchRecentOrders = async () => {
      setRecentOrdersLoading(true);
      setRecentOrdersError(null);
      try {
        // Look for token in both 'jwt' and 'user' keys
        let token = localStorage.getItem('jwt');
        if (!token) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          token = user.token;
        }
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/orders?page=1&limit=4&sort=-createdAt', { headers });
        if (!res.ok) throw new Error('Failed to fetch recent orders');
        const data = await res.json();
        setRecentOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err: any) {
        setRecentOrdersError(err.message || 'Error loading recent orders');
      } finally {
        setRecentOrdersLoading(false);
      }
    };
    fetchRecentOrders();
  }, []);

  const chartConfig = {
    revenue: {
      label: "Revenue (KES)",
      color: "hsl(var(--primary))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--secondary))",
    },
    signups: {
      label: "New Users",
      color: "hsl(var(--accent))",
    },
  };

  const StatCard = ({ title, value, icon: Icon, description, color }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
    color?: string;
  }) => (
    <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color || 'bg-primary/10'}`}>
          <Icon className={`h-4 w-4 ${color ? 'text-white' : 'text-primary'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <AnimatedCounter value={typeof value === 'number' ? value : 0} label="" />
          {typeof value === 'string' && value.includes('KES') && (
            <span className="text-sm font-normal ml-1">KES</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  const totalOrdersByCategory = ordersByCategoryData.reduce((sum, cat) => sum + (cat.orders || 0), 0);

  return (
    <div className="space-y-6 p-2 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
      {loading ? (
        <div className="text-center py-20 text-lg">Loading dashboard...</div>
      ) : error && !loading ? (
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Critical Error</DialogTitle>
            </DialogHeader>
            <div className="py-4">{error}</div>
            <DialogFooter>
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <>
          {/* Header with Date Filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Welcome to BLOOMTECH Hub Admin</p>
            </div>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32 sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last3months">Last 3 Months</SelectItem>
                  <SelectItem value="thisyear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Animated Stats Cards */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 max-w-full">
            <StatCard
              title="Total Products"
              value={stats?.totalProducts || 0}
              icon={Package}
              description="Items in catalog"
              color="bg-blue-500"
            />
            <StatCard
              title="Total Orders"
              value={stats?.totalOrders || 0}
              icon={ShoppingCart}
              description="Orders received"
              color="bg-green-500"
            />
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={Users}
              description="Registered users"
              color="bg-purple-500"
            />
            <StatCard
              title="Reviews"
              value={stats?.totalReviews || 0}
              icon={MessageSquare}
              description="Customer reviews"
              color="bg-orange-500"
            />
            {isSuperAdmin() && (
              <StatCard
                title="Revenue"
                value={stats?.revenue || 0}
                icon={TrendingUp}
                description="Total revenue (KES)"
                color="bg-emerald-500"
              />
            )}
            <StatCard
              title="Newsletter"
              value={stats?.subscribers || 0}
              icon={Mail}
              description="Subscribers"
              color="bg-pink-500"
            />
          </div>

          {/* Charts Section - Top Row */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-full">
            {/* Revenue Trend Chart (SuperAdmin only) */}
            {isSuperAdmin() && (
              <Card className="max-w-full">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue for the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto max-w-full">
                  <ChartContainer config={chartConfig} className="h-[300px] w-full min-w-[320px] max-w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="month" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => `${value / 1000}K`}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-revenue)"
                          strokeWidth={3}
                          dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: "var(--color-revenue)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
            {/* User Signups Chart */}
            <Card className="max-w-full">
              <CardHeader>
                <CardTitle>User Signups</CardTitle>
                <CardDescription>Monthly new user registrations</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto max-w-full">
                <ChartContainer config={chartConfig} className="h-[300px] w-full min-w-[320px] max-w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userSignupsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${value} users`, 'New Signups']}
                      />
                      <Bar
                        dataKey="signups"
                        fill="var(--color-signups)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            {/* Orders by Category Chart */}
            <Card className="max-w-full">
              <CardHeader>
                <CardTitle>Orders by Category</CardTitle>
                <CardDescription>Distribution of orders</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto max-w-full">
                <ChartContainer config={chartConfig} className="h-[300px] w-full min-w-[320px] max-w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersByCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="orders"
                        nameKey="category"
                        isAnimationActive={true}
                      >
                        {ordersByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || '#1E3A8A'} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={<OrdersByCategoryTooltip totalOrders={totalOrdersByCategory} />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  {ordersByCategoryData.map((entry, idx) => (
                    <div key={entry.category} className="flex items-center gap-2">
                      <span
                        className="inline-block w-4 h-4 rounded-full"
                        style={{ backgroundColor: categoryColors[entry.category] || '#1E3A8A' }}
                      ></span>
                      <span className="text-sm">
                        {categoryDisplayMap[entry.category] || entry.category}: <strong>{entry.orders}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Bottom Row: Recent Orders */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 max-w-full mt-2">
            {/* Recent Orders */}
            <Card className="max-w-full">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrdersLoading ? (
                  <div className="text-center py-4">Loading recent orders...</div>
                ) : recentOrdersError ? (
                  <div className="text-center py-4 text-red-500">{recentOrdersError}</div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No recent orders.</div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order._id || order.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Order #{order._id?.slice(-6) || order.id?.slice(-6) || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{order.userId?.name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">KES {order.total?.toLocaleString?.() || '0'}</p>
                          <p className="text-xs text-green-600">{order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Items */}
          {/* Removed Low Stock Alert Card */}
        </>
      )}
    </div>
  );
};

export default Dashboard;