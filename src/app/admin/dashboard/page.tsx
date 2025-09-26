'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Fab,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getCurrencyFlag } from '@/lib/exchange-rates';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Tenant {
  id: string;
  business_name: string;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

interface TenantStats {
  total_invoices: number;
  total_revenue: number;
  active_users: number;
}

interface User {
  id: string;
  email: string;
  role: string;
}

const COLORS = ['#a67c00', '#746354', '#8BC34A', '#FF9800', '#F44336', '#2196F3'];

export default function AdminDashboard() {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantStats, setTenantStats] = useState<Record<string, TenantStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

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
      // Clear localStorage
      localStorage.removeItem('ardent_admin');
      localStorage.removeItem('ardent_user');
      
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
              setUser(adminData);
              
              console.log('✅ NUCLEAR: Admin dashboard access granted via localStorage');
              
              // Load tenants data
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

        // Load tenants data
        await loadTenantsData();

      } catch (error: unknown) {
        console.error('Error loading admin data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router]);

  const loadTenantsData = async () => {
    try {
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;
      setTenants(tenantsData || []);

      // Load stats for each tenant
      const statsPromises = (tenantsData || []).map(async (tenant) => {
        const [invoicesResult, usersResult] = await Promise.all([
          supabase
            .from('invoices')
            .select('amount')
            .eq('tenant_id', tenant.id),
          supabase
            .from('users')
            .select('id')
            .eq('tenant_id', tenant.id)
        ]);

        const totalInvoices = invoicesResult.data?.length || 0;
        const totalRevenue = invoicesResult.data?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
        const activeUsers = usersResult.data?.length || 0;

        return {
          tenantId: tenant.id,
          stats: { total_invoices: totalInvoices, total_revenue: totalRevenue, active_users: activeUsers }
        };
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap = statsResults.reduce((acc, { tenantId, stats }) => {
        acc[tenantId] = stats;
        return acc;
      }, {} as Record<string, TenantStats>);

      setTenantStats(statsMap);

    } catch (error) {
      console.error('Error loading tenants data:', error);
      showSnackbar('Failed to load tenants data', 'error');
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditDialogOpen(true);
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const handleSaveTenant = async () => {
    if (!selectedTenant) return;

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          business_name: selectedTenant.business_name,
          subscription_tier: selectedTenant.subscription_tier,
          subscription_status: selectedTenant.subscription_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTenant.id);

      if (error) throw error;

      setEditDialogOpen(false);
      setSelectedTenant(null);
      showSnackbar('Tenant updated successfully');
      await loadTenantsData();
    } catch (error) {
      console.error('Error updating tenant:', error);
      showSnackbar('Failed to update tenant', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTenant) return;

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', selectedTenant.id);

      if (error) throw error;

      setDeleteDialogOpen(false);
      setSelectedTenant(null);
      showSnackbar('Tenant deleted successfully');
      await loadTenantsData();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      showSnackbar('Failed to delete tenant', 'error');
    }
  };

  const getSubscriptionTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'success';
      case 'pro': return 'primary';
      case 'starter': return 'warning';
      case 'free': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = searchTerm === '' || 
      tenant.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === '' || tenant.subscription_tier === tierFilter;
    const matchesStatus = statusFilter === '' || tenant.subscription_status === statusFilter;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  const totalStats = Object.values(tenantStats).reduce((acc, stats) => ({
    totalInvoices: acc.totalInvoices + stats.total_invoices,
    totalRevenue: acc.totalRevenue + stats.total_revenue,
    totalUsers: acc.totalUsers + stats.active_users,
  }), { totalInvoices: 0, totalRevenue: 0, totalUsers: 0 });

  // Generate chart data for monthly tenant growth
  const monthlyGrowthData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const monthTenants = tenants.filter(t => 
      new Date(t.created_at).getMonth() === date.getMonth() && 
      new Date(t.created_at).getFullYear() === date.getFullYear()
    ).length;
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      tenants: monthTenants,
      revenue: monthTenants * 500, // Placeholder revenue calculation
    };
  });

  const tierDistributionData = Object.entries(
    tenants.reduce((acc, tenant) => {
      acc[tenant.subscription_tier] = (acc[tenant.subscription_tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([tier, count]) => ({ tier, count }));

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Enhanced Header */}
      <AppBar position="sticky" elevation={0} sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        backdropFilter: 'blur(20px)',
        background: nextTheme === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)'
      }}>
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <DashboardIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Ardent Invoicing - Admin
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              icon={<SecurityIcon />}
              label="Super Admin" 
              color="primary" 
              variant="outlined"
              size="small"
            />
            
            <IconButton onClick={toggleTheme} color="inherit" sx={{ 
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' }
            }}>
              {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <IconButton onClick={handleProfileMenuOpen} color="inherit">
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.email}! Here's an overview of your platform.
          </Typography>
        </Box>

        {/* Enhanced Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #a67c00 0%, #d4af37 100%)',
              color: 'white',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {tenants.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Tenants
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
              color: 'white',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalStats.totalUsers}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Active Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
              color: 'white',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCurrency(totalStats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Platform Revenue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
              color: 'white',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalStats.totalInvoices}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Invoices
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Tenant Growth
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="tenants" 
                        stroke="#a67c00" 
                        strokeWidth={3}
                        dot={{ fill: '#a67c00', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subscription Tiers
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tierDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ tier, count }) => `${tier}: ${count}`}
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
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Tenants Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                All Tenants ({filteredTenants.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadTenantsData}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Export Data
                </Button>
              </Box>
            </Box>

            {/* Enhanced Filters */}
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
                sx={{ minWidth: 200 }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Subscription</InputLabel>
                <Select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  label="Subscription"
                >
                  <SelectMenuItem value="">All Tiers</SelectMenuItem>
                  <SelectMenuItem value="free">Free</SelectMenuItem>
                  <SelectMenuItem value="starter">Starter</SelectMenuItem>
                  <SelectMenuItem value="pro">Pro</SelectMenuItem>
                  <SelectMenuItem value="enterprise">Enterprise</SelectMenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <SelectMenuItem value="">All Status</SelectMenuItem>
                  <SelectMenuItem value="active">Active</SelectMenuItem>
                  <SelectMenuItem value="inactive">Inactive</SelectMenuItem>
                  <SelectMenuItem value="suspended">Suspended</SelectMenuItem>
                  <SelectMenuItem value="pending">Pending</SelectMenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Enhanced Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell><strong>Business Name</strong></TableCell>
                    <TableCell><strong>Subscription</strong></TableCell>
                    <TableCell><strong>Invoices</strong></TableCell>
                    <TableCell><strong>Revenue</strong></TableCell>
                    <TableCell><strong>Users</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {tenant.business_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {tenant.business_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={tenant.subscription_tier.toUpperCase()} 
                          color={getSubscriptionTierColor(tenant.subscription_tier) as any}
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
                          {formatCurrency(tenantStats[tenant.id]?.total_revenue || 0)}
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
                          label={tenant.subscription_status.toUpperCase()} 
                          color={getStatusColor(tenant.subscription_status) as any}
                          size="small"
                          icon={tenant.subscription_status === 'active' ? <CheckCircleIcon /> : 
                                tenant.subscription_status === 'inactive' ? <CancelIcon /> : 
                                tenant.subscription_status === 'suspended' ? <WarningIcon /> : <InfoIcon />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Tenant">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleEditTenant(tenant)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Tenant">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteTenant(tenant)}
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
      </Container>

      {/* Edit Tenant Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Tenant</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Business Name"
              value={selectedTenant?.business_name || ''}
              onChange={(e) => setSelectedTenant({...selectedTenant!, business_name: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Subscription Tier</InputLabel>
              <Select
                value={selectedTenant?.subscription_tier || ''}
                onChange={(e) => setSelectedTenant({...selectedTenant!, subscription_tier: e.target.value})}
                label="Subscription Tier"
              >
                <SelectMenuItem value="free">Free</SelectMenuItem>
                <SelectMenuItem value="starter">Starter</SelectMenuItem>
                <SelectMenuItem value="pro">Pro</SelectMenuItem>
                <SelectMenuItem value="enterprise">Enterprise</SelectMenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedTenant?.subscription_status || ''}
                onChange={(e) => setSelectedTenant({...selectedTenant!, subscription_status: e.target.value})}
                label="Status"
              >
                <SelectMenuItem value="active">Active</SelectMenuItem>
                <SelectMenuItem value="inactive">Inactive</SelectMenuItem>
                <SelectMenuItem value="suspended">Suspended</SelectMenuItem>
                <SelectMenuItem value="pending">Pending</SelectMenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTenant} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Tenant</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedTenant?.business_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
}