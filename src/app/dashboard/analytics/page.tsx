'use client';

import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Avatar
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { fetchInvoices, fetchExpenses } from '@/lib/supabase-queries';
import { formatCurrency } from '@/lib/exchange-rates';
import SMELayout from '@/components/sme/SMELayout';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#8BC34A', '#FF9800', '#F44336', '#2196F3'];

interface AnalyticsData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalCustomers: number;
  revenueGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
  invoiceGrowth: number;
  customerGrowth: number;
}

interface ChartData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  invoices: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function AnalyticsPage() {
  const { tenant } = useAppStore();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0,
    invoiceGrowth: 0,
    customerGrowth: 0,
  });
  const [revenueChartData, setRevenueChartData] = useState<ChartData[]>([]);
  const [statusChartData, setStatusChartData] = useState<StatusData[]>([]);
  const [expenseCategoryData, setExpenseCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('12months');

  useEffect(() => {
    if (tenant?.id) {
      loadAnalyticsData();
    }
  }, [tenant?.id, timePeriod]);

  const loadAnalyticsData = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      
      // Calculate date range based on time period
      const now = new Date();
      let startDate: Date;
      let periods: number;
      
      switch (timePeriod) {
        case '3months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          periods = 3;
          break;
        case '6months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          periods = 6;
          break;
        case '12months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
          periods = 12;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
          periods = 12;
      }

      // Fetch data in parallel
      const [invoicesData, expensesData] = await Promise.all([
        fetchInvoices(tenant.id),
        fetchExpenses(tenant.id)
      ]);

      // Calculate current period analytics
      const currentPeriodInvoices = invoicesData.filter(inv => 
        new Date(inv.created_at) >= startDate
      );
      const currentPeriodExpenses = expensesData.filter(exp => 
        new Date(exp.expense_date) >= startDate
      );

      // Calculate previous period for growth comparison
      const previousStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      const previousPeriodInvoices = invoicesData.filter(inv => 
        new Date(inv.created_at) >= previousStart && new Date(inv.created_at) < startDate
      );
      const previousPeriodExpenses = expensesData.filter(exp => 
        new Date(exp.expense_date) >= previousStart && new Date(exp.expense_date) < startDate
      );

      // Calculate metrics
      const totalRevenue = currentPeriodInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalExpenses = currentPeriodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const netProfit = totalRevenue - totalExpenses;

      const previousRevenue = previousPeriodInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const previousExpenses = previousPeriodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const previousProfit = previousRevenue - previousExpenses;

      // Calculate growth percentages
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const expenseGrowth = previousExpenses > 0 ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 : 0;
      const profitGrowth = previousProfit !== 0 ? ((netProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0;

      // Invoice status counts
      const paidInvoices = currentPeriodInvoices.filter(inv => inv.status === 'paid').length;
      const pendingInvoices = currentPeriodInvoices.filter(inv => inv.status === 'sent').length;
      const overdueInvoices = currentPeriodInvoices.filter(inv => inv.status === 'overdue').length;

      // Unique customers
      const uniqueCustomers = new Set(currentPeriodInvoices.map(inv => inv.client_email)).size;
      const previousCustomers = new Set(previousPeriodInvoices.map(inv => inv.client_email)).size;
      const customerGrowth = previousCustomers > 0 ? ((uniqueCustomers - previousCustomers) / previousCustomers) * 100 : 0;

      // Invoice growth
      const invoiceGrowth = previousPeriodInvoices.length > 0 ? 
        ((currentPeriodInvoices.length - previousPeriodInvoices.length) / previousPeriodInvoices.length) * 100 : 0;

      setAnalyticsData({
        totalRevenue,
        totalExpenses,
        netProfit,
        totalInvoices: currentPeriodInvoices.length,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        totalCustomers: uniqueCustomers,
        revenueGrowth,
        expenseGrowth,
        profitGrowth,
        invoiceGrowth,
        customerGrowth,
      });

      // Generate chart data
      generateRevenueChartData(invoicesData, expensesData, periods);
      generateStatusChartData(paidInvoices, pendingInvoices, overdueInvoices);
      generateExpenseCategoryData(currentPeriodExpenses);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRevenueChartData = (invoices: any[], expenses: any[], periods: number) => {
    const chartData: ChartData[] = [];
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
      });
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.expense_date);
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
      });
      
      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const expensesAmount = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      chartData.push({
        period: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue,
        expenses: expensesAmount,
        profit: revenue - expensesAmount,
        invoices: monthInvoices.length,
      });
    }
    
    setRevenueChartData(chartData);
  };

  const generateStatusChartData = (paid: number, pending: number, overdue: number) => {
    const total = paid + pending + overdue;
    if (total === 0) {
      setStatusChartData([]);
      return;
    }

    setStatusChartData([
      { name: 'Paid', value: paid, color: COLORS[2] },
      { name: 'Pending', value: pending, color: COLORS[4] },
      { name: 'Overdue', value: overdue, color: COLORS[5] },
    ]);
  };

  const generateExpenseCategoryData = (expenses: any[]) => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    const categoryData: CategoryData[] = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }));

    setExpenseCategoryData(categoryData);
  };

  const getGrowthIcon = (growth: number | undefined) => {
    const value = growth || 0;
    return value >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />;
  };

  const getGrowthColor = (growth: number | undefined) => {
    const value = growth || 0;
    return value >= 0 ? 'success.main' : 'error.main';
  };

  if (loading) {
    return (
      <SMELayout title="Analytics">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </SMELayout>
    );
  }

  return (
    <SMELayout title="Analytics">
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Analytics Dashboard
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="12months">Last 12 Months</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {formatCurrency(analyticsData.totalRevenue, 'GHS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total Revenue
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getGrowthIcon(analyticsData.revenueGrowth)}
                      <Typography 
                        variant="caption" 
                        color={getGrowthColor(analyticsData.revenueGrowth)}
                        sx={{ fontWeight: 600 }}
                      >
                        {Math.abs(analyticsData.revenueGrowth || 0).toFixed(1)}%
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
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {formatCurrency(analyticsData.totalExpenses, 'GHS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total Expenses
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getGrowthIcon(analyticsData.expenseGrowth)}
                      <Typography 
                        variant="caption" 
                        color={getGrowthColor(analyticsData.expenseGrowth)}
                        sx={{ fontWeight: 600 }}
                      >
                        {Math.abs(analyticsData.expenseGrowth || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                    <AssessmentIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: analyticsData.netProfit >= 0 ? 'success.main' : 'error.main' }}>
                      {formatCurrency(analyticsData.netProfit, 'GHS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Net Profit
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getGrowthIcon(analyticsData.profitGrowth)}
                      <Typography 
                        variant="caption" 
                        color={getGrowthColor(analyticsData.profitGrowth)}
                        sx={{ fontWeight: 600 }}
                      >
                        {Math.abs(analyticsData.profitGrowth || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: analyticsData.netProfit >= 0 ? 'success.main' : 'error.main', width: 56, height: 56 }}>
                    <TrendingUpIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {analyticsData.totalCustomers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Active Customers
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getGrowthIcon(analyticsData.customerGrowth)}
                      <Typography 
                        variant="caption" 
                        color={getGrowthColor(analyticsData.customerGrowth)}
                        sx={{ fontWeight: 600 }}
                      >
                        {Math.abs(analyticsData.customerGrowth || 0).toFixed(1)}%
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
        </Grid>

        {/* Charts Row 1 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Revenue vs Expenses Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          formatCurrency(value, 'GHS'),
                          name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stackId="1"
                        stroke="#667eea" 
                        fill="#667eea" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stackId="1"
                        stroke="#764ba2" 
                        fill="#764ba2" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Invoice Status Distribution
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [value, 'Invoices']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {statusChartData.map((item, index) => (
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
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 2 */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Monthly Invoice Volume
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [value, 'Invoices']} />
                      <Bar dataKey="invoices" fill="#667eea" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Expense Categories
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [formatCurrency(value, 'GHS'), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {expenseCategoryData.map((item, index) => (
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
        </Grid>
      </Box>
    </SMELayout>
  );
}
