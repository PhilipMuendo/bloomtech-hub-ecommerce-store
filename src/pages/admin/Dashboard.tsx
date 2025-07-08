import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Package, ShoppingCart, Users, MessageSquare, Mail, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { products } from '@/data/products';
import AnimatedCounter from '@/components/AnimatedCounter';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersByCategoryData, setOrdersByCategoryData] = useState([]);
  const [userSignupsData, setUserSignupsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

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

  return (
    <div className="space-y-6 p-6">
      {loading ? (
        <div className="text-center py-20 text-lg">Loading dashboard...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : (
        <>
          {/* Header with Date Filter */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Welcome to BLOOMTECH Hub Admin</p>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
            <StatCard
              title="Revenue"
              value={stats?.revenue || 0}
              icon={TrendingUp}
              description="Total revenue (KES)"
              color="bg-emerald-500"
            />
            <StatCard
              title="Newsletter"
              value={stats?.subscribers || 0}
              icon={Mail}
              description="Subscribers"
              color="bg-pink-500"
            />
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Revenue Trend Chart */}
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue for the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
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

            {/* Orders by Category Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Category</CardTitle>
                <CardDescription>Distribution of orders</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                      >
                        {ordersByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [`${value} orders`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* User Signups Chart */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Signups</CardTitle>
                <CardDescription>Monthly new user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
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

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Order #{1000 + i}</p>
                          <p className="text-sm text-muted-foreground">Customer {i}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KES {(15000 + i * 5000).toLocaleString()}</p>
                        <p className="text-xs text-green-600">Completed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Items */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Products running low in inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 6).map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">5 left</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;