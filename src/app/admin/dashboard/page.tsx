'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/exchange-rates';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';

interface Tenant {
  id: string;
  business_name: string;
  created_at: string;
  subscription_tier?: string;
  subscription_status?: string;
}

interface TenantStats {
  [tenantId: string]: {
    total_invoices: number;
    total_revenue: number;
    active_users: number;
  };
}

interface DashboardStats {
  totalTenants: number;
  totalRevenue: number;
  totalInvoices: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantStats, setTenantStats] = useState<TenantStats>({});
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTenants: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    totalUsers: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Initialize admin real-time features
  const { 
    systemStats, 
    realtimeMetrics, 
    isConnected,
    createSystemAlert 
  } = useAdminRealtime({
    enableSystemMonitoring: true,
    enableNotifications: true,
    onError: (error) => {
      console.error('Admin realtime error:', error);
    }
  });
  const [newTenantDialog, setNewTenantDialog] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [newTenant, setNewTenant] = useState({
    business_name: '',
    subscription_tier: 'free',
    subscription_status: 'active',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // NUCLEAR OPTION: Admin dashboard starting with localStorage approach...
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        console.log('🚀 NUCLEAR: Admin dashboard starting with localStorage approach...');
        
        // NUCLEAR OPTION: Check localStorage first for admin data
        const storedAdmin = localStorage.getItem('ardent_admin');
        if (storedAdmin) {
          try {
            const adminData = JSON.parse(storedAdmin);
            const now = Date.now();
            const adminAge = now - adminData.timestamp;
            
            console.log('🔍 NUCLEAR: Found stored admin data:', {
              id: adminData.id,
              email: adminData.email,
              role: adminData.role,
              age: Math.round(adminAge / 1000) + 's ago'
            });
            
            // Check if data is fresh (less than 5 minutes old)
            if (adminAge < 5 * 60 * 1000) {
              console.log('✅ NUCLEAR: Using stored admin data');
              
              // Set admin in store
              useAppStore.getState().setUser(adminData);
              
              console.log('✅ NUCLEAR: Admin dashboard access granted via localStorage');
              await loadTenantsData();
              return;
            } else {
              console.log('⚠️ NUCLEAR: Stored admin data too old, falling back to session');
            }
          } catch (parseError) {
            console.log('⚠️ NUCLEAR: Failed to parse stored admin data, falling back to session');
          }
        }
        
        // Fallback: Try session-based approach
        console.log('🔍 NUCLEAR: Falling back to session-based authentication...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('❌ NUCLEAR: No session found, redirecting to admin login');
          router.push('/admin/login');
          return;
        }
        
        console.log('✅ NUCLEAR: Session found, proceeding with normal flow');

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        if (userData.role !== 'super') {
          console.log('❌ NUCLEAR: Invalid role for admin dashboard');
          router.push('/admin/login');
          return;
        }

        setUser(userData);

        // Fetch all tenants with stats
        await loadTenantsData();
        
        // Fetch revenue data
        await fetchRevenueData();

      } catch (error: any) {
        console.error('❌ NUCLEAR: Admin dashboard error:', error);
        setSnackbar({ open: true, message: 'Failed to load dashboard data', severity: 'error' });
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router, setUser]);

  const loadTenantsData = async () => {
    try {
      // Fetch all tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;

      // Fetch subscription info for each tenant from users table
      const tenantsWithSubscription = await Promise.all(
        (tenantsData || []).map(async (tenant) => {
          const { data: userData } = await supabase
            .from('users')
            .select('subscription_tier, subscription_status')
            .eq('tenant_id', tenant.id)
            .eq('role', 'sme')
            .single();
          
          return {
            ...tenant,
            subscription_tier: userData?.subscription_tier || 'free',
            subscription_status: userData?.subscription_status || 'active'
          };
        })
      );

      setTenants(tenantsWithSubscription);

      // Calculate stats for each tenant
      const stats: TenantStats = {};
      let totalRevenue = 0;
      let totalInvoices = 0;
      let totalUsers = 0;

      for (const tenant of tenantsWithSubscription) {
        const [invoicesResult, usersResult] = await Promise.all([
          supabase
            .from('invoices')
            .select('amount, status')
            .eq('tenant_id', tenant.id),
          supabase
            .from('users')
            .select('id, role')
            .eq('tenant_id', tenant.id)
            .eq('role', 'sme')
        ]);

        const totalInvoicesForTenant = invoicesResult.data?.length || 0;
        const totalRevenueForTenant = invoicesResult.data?.reduce((sum, invoice) => {
          // Only count paid invoices for revenue
          return invoice.status === 'paid' ? sum + (invoice.amount || 0) : sum;
        }, 0) || 0;
        const activeUsersForTenant = usersResult.data?.length || 0;

        stats[tenant.id] = {
          total_invoices: totalInvoicesForTenant,
          total_revenue: totalRevenueForTenant,
          active_users: activeUsersForTenant,
        };

        totalRevenue += totalRevenueForTenant;
        totalInvoices += totalInvoicesForTenant;
        totalUsers += activeUsersForTenant;
      }

      setTenantStats(stats);
      setDashboardStats({
        totalTenants: tenantsWithSubscription?.length || 0,
        totalRevenue,
        totalInvoices,
        totalUsers,
      });

    } catch (error: any) {
      console.error('Error loading tenants data:', error);
      setSnackbar({ open: true, message: 'Failed to load tenants data', severity: 'error' });
    }
  };

  const getSubscriptionTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'success';
      case 'pro': return 'info';
      case 'starter': return 'warning';
      case 'free': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = searchTerm === '' || 
      (tenant.business_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === '' || (tenant.subscription_tier || 'free') === tierFilter;
    const matchesStatus = statusFilter === '' || (tenant.subscription_status || 'inactive') === statusFilter;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Real-time revenue data from actual invoices
  const [revenueData, setRevenueData] = useState<Array<{month: string, revenue: number}>>([]);

  const fetchRevenueData = async () => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const revenueData = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = months[monthIndex];
        
        // Calculate start and end of month
        const year = new Date().getFullYear();
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0);
        
        // Fetch invoices for this month
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('amount, status')
          .eq('status', 'paid')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
        
        if (error) throw error;
        
        const monthlyRevenue = invoices?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0;
        
        revenueData.push({
          month: monthName,
          revenue: monthlyRevenue
        });
      }
      
      setRevenueData(revenueData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const tierDistributionData = Object.entries(
    tenants.reduce((acc, tenant) => {
      const tier = tenant.subscription_tier || 'free';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([tier, count]) => ({ tier, count }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <AdminLayout title="Dashboard" user={user}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" user={user}>
      {/* Page Title */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isConnected ? 'success.main' : 'error.main',
                animation: isConnected ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.5,
                  },
                  '100%': {
                    opacity: 1,
                  },
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {isConnected ? 'Real-time Connected' : 'Disconnected'}
            </Typography>
          </Box>
        </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {systemStats.totalTenants.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Tenants
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                    +{realtimeMetrics.newTenantsToday} today
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <BusinessIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(systemStats.totalRevenue, 'GHS')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                    +{formatCurrency(realtimeMetrics.revenueToday, 'GHS')} today
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <MoneyIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {dashboardStats.totalInvoices.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Invoices
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ReceiptIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {dashboardStats.totalUsers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Users
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PeopleIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Revenue Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <RechartsTooltip formatter={(value) => [formatCurrency(Number(value), 'GHS'), 'Revenue']} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#667eea" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Tiers Distribution */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Subscription Tiers
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={tierDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tier, percent }) => `${tier} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {tierDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tenants Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tenants Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewTenantDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              Add Tenant
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Subscription Tier</InputLabel>
              <Select
                value={tierFilter}
                label="Subscription Tier"
                onChange={(e) => setTierFilter(e.target.value)}
              >
                <MenuItem value="">All Tiers</MenuItem>
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business</TableCell>
                  <TableCell>Subscription</TableCell>
                  <TableCell>Invoices</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {(tenant.business_name || 'N/A').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {tenant.business_name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={(tenant.subscription_tier || 'free').toUpperCase()} 
                        color={getSubscriptionTierColor(tenant.subscription_tier || 'free') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tenantStats[tenant.id]?.total_invoices || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(tenantStats[tenant.id]?.total_revenue || 0, 'GHS')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tenantStats[tenant.id]?.active_users || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={(tenant.subscription_status || 'inactive').toUpperCase()} 
                        color={getStatusColor(tenant.subscription_status || 'inactive') as any}
                        size="small"
                        icon={(tenant.subscription_status || 'inactive') === 'active' ? <CheckCircleIcon /> : 
                              (tenant.subscription_status || 'inactive') === 'inactive' ? <CancelIcon /> : 
                              (tenant.subscription_status || 'inactive') === 'suspended' ? <WarningIcon /> : <InfoIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              // Navigate to tenant details page
                              router.push(`/admin/tenants/${tenant.id}`);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => {
                              // Open edit dialog
                              setEditTenant(tenant);
                              setNewTenant({
                                business_name: tenant.business_name,
                                subscription_tier: tenant.subscription_tier || 'free',
                                subscription_status: tenant.subscription_status || 'active'
                              });
                              setNewTenantDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete "${tenant.business_name}"? This action cannot be undone.`)) {
                                try {
                                  const { error } = await supabase
                                    .from('tenants')
                                    .delete()
                                    .eq('id', tenant.id);

                                  if (error) throw error;

                                  await loadTenantsData();
                                  setSnackbar({ open: true, message: 'Tenant deleted successfully', severity: 'success' });
                                } catch (error: any) {
                                  console.error('Error deleting tenant:', error);
                                  setSnackbar({ open: true, message: 'Failed to delete tenant', severity: 'error' });
                                }
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* New/Edit Tenant Dialog */}
      <Dialog 
        open={newTenantDialog} 
        onClose={() => {
          setNewTenantDialog(false);
          setEditTenant(null);
          setNewTenant({ business_name: '', subscription_tier: 'free', subscription_status: 'active' });
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>{editTenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Business Name"
            value={newTenant.business_name}
            onChange={(e) => setNewTenant({ ...newTenant, business_name: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Subscription Tier</InputLabel>
            <Select
              value={newTenant.subscription_tier}
              label="Subscription Tier"
              onChange={(e) => setNewTenant({ ...newTenant, subscription_tier: e.target.value })}
            >
              {SUBSCRIPTION_PLANS.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name} - {formatCurrency(plan.price.monthly, 'GHS')}/month
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={newTenant.subscription_status}
              label="Status"
              onChange={(e) => setNewTenant({ ...newTenant, subscription_status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setNewTenantDialog(false);
              setEditTenant(null);
              setNewTenant({ business_name: '', subscription_tier: 'free', subscription_status: 'active' });
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={async () => {
              try {
                if (!newTenant.business_name.trim()) {
                  setSnackbar({ open: true, message: 'Business name is required', severity: 'error' });
                  return;
                }

                if (editTenant) {
                  // Update existing tenant
                  const { error: updateError } = await supabase
                    .from('tenants')
                    .update({
                      business_name: newTenant.business_name.trim(),
                    })
                    .eq('id', editTenant.id);

                  if (updateError) throw updateError;
                  
                  setSnackbar({ open: true, message: 'Tenant updated successfully', severity: 'success' });
                } else {
                // Create new tenant
                const { error: insertError } = await supabase
                  .from('tenants')
                  .insert({
                    business_name: newTenant.business_name.trim(),
                  });

                  if (insertError) throw insertError;
                  
                  setSnackbar({ open: true, message: 'Tenant added successfully', severity: 'success' });
                }

                // Reload data
                await loadTenantsData();
                
                setNewTenantDialog(false);
                setEditTenant(null);
                setNewTenant({ business_name: '', subscription_tier: 'free', subscription_status: 'active' });
              } catch (error: any) {
                console.error('Error saving tenant:', error);
                setSnackbar({ open: true, message: `Failed to ${editTenant ? 'update' : 'add'} tenant`, severity: 'error' });
              }
            }}
          >
            {editTenant ? 'Update Tenant' : 'Add Tenant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
        >
          {snackbar.message}
        </Alert>
      )}
    </AdminLayout>
  );
}