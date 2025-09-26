'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  Paper,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  AccountCircle as AccountCircleIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getInvoiceStats, getExpenseStats, fetchInvoices, fetchExpenses } from '@/lib/supabase-queries';
import { formatCurrency, getCurrencyFlag } from '@/lib/exchange-rates';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const COLORS = ['#a67c00', '#746354', '#8BC34A', '#FF9800', '#F44336', '#2196F3'];

interface User {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
  subscription_tier: string;
  invoice_quota_used: number;
  is_unlimited_free?: boolean;
}

interface Tenant {
  id: string;
  business_name: string;
}

export default function Dashboard() {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const router = useRouter();
  const { user, tenant, invoices, expenses, setLoading, setError } = useAppStore();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalExpenses: 0,
    expenseCategories: {} as Record<string, number>,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoadingState] = useState(true);
  const [error, setErrorState] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 Dashboard: Auth state change:', { event, hasSession: !!session });
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('❌ Dashboard: User signed out, redirecting to login');
        router.push('/sme/login');
      }
    });

    const fetchUserData = async () => {
      try {
        console.log('🔍 Dashboard: Starting authentication check...');
        
        // Multiple attempts to get session with increasing delays
        let session = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!session && attempts < maxAttempts) {
          attempts++;
          console.log(`🔍 Dashboard: Session attempt ${attempts}/${maxAttempts}...`);
          
          // Wait with increasing delay
          await new Promise(resolve => setTimeout(resolve, attempts * 200));
          
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          session = currentSession;
          
          if (session) {
            console.log('✅ Dashboard: Session found on attempt', attempts);
            break;
          } else {
            console.log(`❌ Dashboard: No session on attempt ${attempts}`);
          }
        }
        
        if (!session) {
          console.log('❌ Dashboard: No session found after all attempts, redirecting to login');
          router.push('/sme/login');
          return;
        }
        
        console.log('🔍 Dashboard: Session confirmed:', { 
          userId: session.user.id, 
          email: session.user.email 
        });

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        if (userData.role !== 'sme') {
          router.push('/sme/login');
          return;
        }

        // Set user in store
        useAppStore.getState().setUser(userData);

        // Fetch tenant data
        if (userData.tenant_id) {
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', userData.tenant_id)
            .single();

          if (tenantError) throw tenantError;
          useAppStore.getState().setTenant(tenantData);
        }

      } catch (error: unknown) {
        setErrorState(error instanceof Error ? error.message : 'Failed to load user data');
      } finally {
        setLoadingState(false);
      }
    };

    fetchUserData();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (tenant?.id) {
      loadDashboardData();
    }
  }, [tenant?.id]);

  const loadDashboardData = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      
      // Load recent invoices and expenses
      const [invoicesData, expensesData] = await Promise.all([
        fetchInvoices(tenant.id),
        fetchExpenses(tenant.id)
      ]);

      // Get stats for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const [invoiceStats, expenseStats] = await Promise.all([
        getInvoiceStats(tenant.id, startOfMonth.toISOString(), endOfMonth.toISOString()),
        getExpenseStats(tenant.id, startOfMonth.toISOString(), endOfMonth.toISOString())
      ]);

      setStats({
        totalInvoices: invoiceStats.totalInvoices,
        totalRevenue: invoiceStats.totalAmount,
        pendingInvoices: invoiceStats.pendingInvoices,
        overdueInvoices: invoiceStats.overdueInvoices,
        totalExpenses: expenseStats.totalAmount,
        expenseCategories: expenseStats.categories,
      });

      // Generate chart data (last 7 days)
      generateChartData(invoicesData, expensesData);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (invoices: any[], expenses: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
      const dayInvoices = invoices.filter(inv => inv.created_at?.startsWith(date));
      const dayExpenses = expenses.filter(exp => exp.expense_date?.startsWith(date));
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: dayInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        expenses: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        net: dayInvoices.reduce((sum, inv) => sum + inv.amount, 0) - dayExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      };
    });

    setChartData(chartData);
  };

  const getSubscriptionTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return '#4caf50';
      case 'pro': return '#2196f3';
      case 'starter': return '#ff9800';
      case 'free': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getQuotaLimit = () => {
    switch (user?.subscription_tier) {
      case 'free': return 2;
      case 'starter': return 20;
      case 'pro': return 400;
      case 'enterprise': return 999999;
      default: return 2;
    }
  };

  const getQuotaPercentage = () => {
    const limit = getQuotaLimit();
    if (limit === 999999) return 0;
    return ((user?.invoice_quota_used || 0) / limit) * 100;
  };

  const recentInvoices = invoices.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);

  const expenseChartData = Object.entries(stats.expenseCategories).map(([category, amount], index) => ({
    name: category,
    value: amount,
    color: COLORS[index % COLORS.length],
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Ardent Invoicing
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {tenant?.business_name}
            </Typography>
            <IconButton onClick={toggleTheme} color="inherit">
              {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton onClick={handleProfileMenuOpen} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <SettingsIcon sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dashboard Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here&apos;s what&apos;s happening with your business today.
          </Typography>
        </Box>

        {/* Subscription Status */}
        {user && (
          <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {tenant?.business_name || 'Your Business'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Plan: 
                    </Typography>
                    <Box sx={{ 
                      bgcolor: getSubscriptionTierColor(user.subscription_tier),
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {user.subscription_tier}
                    </Box>
                    {user.is_unlimited_free && (
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                        UNLIMITED FREE
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Button variant="outlined" size="small">
                  Upgrade Plan
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Key Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {getCurrencyFlag('GHS')} {formatCurrency(stats.totalRevenue, 'GHS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month Revenue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {stats.totalInvoices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Invoices Sent
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {stats.totalExpenses.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {stats.overdueInvoices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Income vs Expenses (Last 7 Days)
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          `${getCurrencyFlag('GHS')} ${value.toFixed(2)}`,
                          name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#a67c00" 
                        strokeWidth={3}
                        name="Income"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#f44336" 
                        strokeWidth={3}
                        name="Expenses"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="net" 
                        stroke="#4caf50" 
                        strokeWidth={3}
                        name="Net"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Expenses by Category
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${getCurrencyFlag('GHS')} ${value.toFixed(2)}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {expenseChartData.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        bgcolor: item.color, 
                        borderRadius: '50%', 
                        mr: 1 
                      }} />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getCurrencyFlag('GHS')} {item.value.toFixed(0)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions and Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => router.push('/dashboard/invoices/new')}
                      sx={{ bgcolor: 'primary.main', py: 1.5 }}
                    >
                      Create Invoice
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => router.push('/dashboard/expenses/new')}
                      sx={{ py: 1.5 }}
                    >
                      Add Expense
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AssessmentIcon />}
                      onClick={() => router.push('/dashboard/invoices')}
                      sx={{ py: 1.5 }}
                    >
                      View All Invoices
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Invoices
                </Typography>
                {recentInvoices.length > 0 ? (
                  <List dense>
                    {recentInvoices.map((invoice, index) => (
                      <ListItem key={invoice.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {invoice.status === 'paid' ? (
                            <CheckCircleIcon color="success" />
                          ) : invoice.status === 'overdue' ? (
                            <WarningIcon color="error" />
                          ) : (
                            <ScheduleIcon color="warning" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={invoice.client_name}
                          secondary={`${getCurrencyFlag(invoice.currency)} ${invoice.amount.toFixed(2)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent invoices
                  </Typography>
                )}
                <Button
                  fullWidth
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push('/dashboard/invoices')}
                  sx={{ mt: 2 }}
                >
                  View All
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Invoice Quota
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Used this month
                    </Typography>
                    <Typography variant="body2">
                      {user?.invoice_quota_used || 0} / {getQuotaLimit() === 999999 ? '∞' : getQuotaLimit()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={getQuotaPercentage()} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getQuotaPercentage() > 80 ? 'error.main' : 'primary.main',
                      }
                    }} 
                  />
                </Box>
                {getQuotaPercentage() > 80 && !user?.is_unlimited_free && (
                  <Button variant="outlined" size="small" color="warning" fullWidth>
                    Upgrade to increase quota
                  </Button>
                )}
                {user?.is_unlimited_free && (
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    ✓ Unlimited invoices included
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Ardent Invoicing. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
