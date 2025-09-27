'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Assessment as BounceIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  MoreVert as MoreIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/exchange-rates';
import { getInvoiceStats, getExpenseStats, fetchInvoices, fetchExpenses } from '@/lib/supabase-queries';

interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  totalCustomers: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalExpenses: number;
  netProfit: number;
  revenueGrowth: number;
  invoiceGrowth: number;
  customerGrowth: number;
}

interface ChartData {
  name: string;
  revenue: number;
  expenses: number;
  invoices: number;
}

interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'invoice' | 'expense' | 'payment';
  title: string;
  amount: number;
  status: string;
  date: string;
}

const COLORS = ['#667eea', '#764ba2', '#8BC34A', '#FF9800', '#F44336', '#2196F3'];

export default function DashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalInvoices: 0,
    totalCustomers: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalExpenses: 0,
    netProfit: 0,
    revenueGrowth: 0,
    invoiceGrowth: 0,
    customerGrowth: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseCategory[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('monthly');

  useEffect(() => {
    loadDashboardData();
  }, [timePeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user and tenant
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

      if (!userData?.tenant_id) return;

      const tenantId = userData.tenant_id;

      // Calculate date range based on time period
      const now = new Date();
      let startDate: Date;
      
      switch (timePeriod) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Fetch data in parallel
      const [invoicesData, expensesData, invoiceStats, expenseStats, customersData] = await Promise.all([
        fetchInvoices(tenantId),
        fetchExpenses(tenantId),
        getInvoiceStats(tenantId, startDate.toISOString(), now.toISOString()),
        getExpenseStats(tenantId, startDate.toISOString(), now.toISOString()),
        supabase.from('invoices').select('client_email').eq('tenant_id', tenantId)
      ]);

      // Calculate unique customers
      const uniqueCustomers = new Set(invoicesData.map(inv => inv.client_email)).size;

      // Calculate previous period for growth comparison
      const previousStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      const [prevInvoiceStats] = await Promise.all([
        getInvoiceStats(tenantId, previousStart.toISOString(), startDate.toISOString())
      ]);

      // Calculate growth percentages
      const revenueGrowth = prevInvoiceStats.totalAmount > 0 
        ? ((invoiceStats.totalAmount - prevInvoiceStats.totalAmount) / prevInvoiceStats.totalAmount) * 100
        : 0;
      
      const invoiceGrowth = prevInvoiceStats.totalInvoices > 0
        ? ((invoiceStats.totalInvoices - prevInvoiceStats.totalInvoices) / prevInvoiceStats.totalInvoices) * 100
        : 0;

      setStats({
        totalRevenue: invoiceStats.totalAmount,
        totalInvoices: invoiceStats.totalInvoices,
        totalCustomers: uniqueCustomers,
        pendingInvoices: invoiceStats.pendingInvoices,
        overdueInvoices: invoiceStats.overdueInvoices,
        totalExpenses: expenseStats.totalAmount,
        netProfit: invoiceStats.totalAmount - expenseStats.totalAmount,
        revenueGrowth,
        invoiceGrowth,
        customerGrowth: 0, // Would need historical customer data
      });

      // Generate chart data
      generateChartData(invoicesData, expensesData);
      
      // Generate expense categories
      generateExpenseData(expenseStats.categories);
      
      // Generate recent activity
      generateRecentActivity(invoicesData, expensesData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (invoices: any[], expenses: any[]) => {
    const periods = timePeriod === 'weekly' ? 7 : timePeriod === 'monthly' ? 12 : 12;
    const chartData: ChartData[] = [];

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      
      if (timePeriod === 'weekly') {
        date.setDate(date.getDate() - i);
        const dayInvoices = invoices.filter(inv => 
          new Date(inv.created_at).toDateString() === date.toDateString()
        );
        const dayExpenses = expenses.filter(exp => 
          new Date(exp.expense_date).toDateString() === date.toDateString()
        );
        
        chartData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          expenses: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          invoices: dayInvoices.length,
        });
      } else {
        date.setMonth(date.getMonth() - i);
        const monthInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.created_at);
          return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
        });
        const monthExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.expense_date);
          return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
        });
        
        chartData.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          expenses: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          invoices: monthInvoices.length,
        });
      }
    }

    setChartData(chartData);
  };

  const generateExpenseData = (categories: Record<string, number>) => {
    const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
    const expenseData: ExpenseCategory[] = Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));

    setExpenseData(expenseData);
  };

  const generateRecentActivity = (invoices: any[], expenses: any[]) => {
    const activity: RecentActivity[] = [];

    // Add recent invoices
    invoices.slice(0, 5).forEach(invoice => {
      activity.push({
        id: invoice.id,
        type: 'invoice',
        title: `Invoice to ${invoice.client_name}`,
        amount: invoice.amount,
        status: invoice.status,
        date: invoice.created_at,
      });
    });

    // Add recent expenses
    expenses.slice(0, 3).forEach(expense => {
      activity.push({
        id: expense.id,
        type: 'expense',
        title: expense.description,
        amount: expense.amount,
        status: 'paid',
        date: expense.expense_date,
      });
    });

    // Sort by date and take first 8
    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentActivity(activity.slice(0, 8));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon color="success" />;
      case 'overdue':
        return <WarningIcon color="error" />;
      default:
        return <ScheduleIcon color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            size="small"
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            size="small"
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.totalInvoices.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Invoices
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {stats.invoiceGrowth >= 0 ? (
                      <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                    ) : (
                      <TrendingDownIcon color="error" sx={{ fontSize: 16 }} />
                    )}
                    <Typography 
                      variant="caption" 
                      color={stats.invoiceGrowth >= 0 ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 600 }}
                    >
                      {Math.abs(stats.invoiceGrowth).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <VisibilityIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(stats.totalRevenue, 'GHS')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Revenue
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {stats.revenueGrowth >= 0 ? (
                      <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                    ) : (
                      <TrendingDownIcon color="error" sx={{ fontSize: 16 }} />
                    )}
                    <Typography 
                      variant="caption" 
                      color={stats.revenueGrowth >= 0 ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 600 }}
                    >
                      {Math.abs(stats.revenueGrowth).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <MoneyIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.totalCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Customers
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                      +{stats.customerGrowth.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <PeopleIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.overdueInvoices}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Overdue Invoices
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingDownIcon color="error" sx={{ fontSize: 16 }} />
                    <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                      {((stats.overdueInvoices / stats.totalInvoices) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <BounceIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Revenue Overview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatCurrency(stats.totalRevenue, 'GHS')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {stats.revenueGrowth >= 0 ? (
                      <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                    ) : (
                      <TrendingDownIcon color="error" sx={{ fontSize: 16 }} />
                    )}
                    <Typography 
                      variant="caption" 
                      color={stats.revenueGrowth >= 0 ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 600 }}
                    >
                      {Math.abs(stats.revenueGrowth).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'revenue' ? formatCurrency(value, 'GHS') : value,
                        name === 'revenue' ? 'Revenue' : 'Invoices'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#667eea" 
                      strokeWidth={3}
                      dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="invoices" 
                      stroke="#764ba2" 
                      strokeWidth={3}
                      dot={{ fill: '#764ba2', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Customers
                </Typography>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select value="weekly">
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.totalCustomers.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    +{stats.customerGrowth.toFixed(1)}% increased
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="invoices" fill="#667eea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Expense Distribution
                </Typography>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select value="monthly">
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [formatCurrency(value, 'GHS'), 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                {expenseData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      bgcolor: item.color, 
                      borderRadius: '50%', 
                      mr: 2 
                    }} />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(item.value, 'GHS')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <Button size="small" color="primary">
                  See All
                </Button>
              </Box>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: activity.type === 'invoice' ? 'primary.main' : 'success.main',
                          width: 32,
                          height: 32
                        }}>
                          {activity.type === 'invoice' ? (
                            <AssessmentIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <MoneyIcon sx={{ fontSize: 16 }} />
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {activity.title}
                            </Typography>
                            <Chip 
                              label={activity.status}
                              size="small"
                              color={getStatusColor(activity.status) as any}
                              sx={{ height: 20, fontSize: '0.625rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(activity.amount, 'GHS')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
