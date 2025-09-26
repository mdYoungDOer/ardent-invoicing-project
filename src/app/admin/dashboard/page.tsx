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
  InputAdornment
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
  Block as BlockIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getCurrencyFlag } from '@/lib/exchange-rates';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Tenant {
  id: string;
  business_name: string;
  sme_user_id: string;
  subscription_tier: string;
  created_at: string;
  is_active: boolean;
}

interface TenantStats {
  total_invoices: number;
  total_revenue: number;
  active_users: number;
}

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

      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router]);

  const loadTenantsData = async () => {
    try {
      // Fetch all tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;
      setTenants(tenantsData || []);

      // Fetch stats for each tenant
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

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = searchTerm === '' || 
      tenant.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === '' || tenant.subscription_tier === tierFilter;
    
    return matchesSearch && matchesTier;
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
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Ardent Invoicing - Admin
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Super Admin
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
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.email}! Here&apos;s an overview of your platform.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {tenants.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tenants
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
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalStats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
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
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {getCurrencyFlag('GHS')} {formatCurrency(totalStats.totalRevenue, 'GHS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Platform Revenue
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
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalStats.totalInvoices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Invoices
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
                  Monthly Tenant Growth
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="tenants" 
                        stroke="#a67c00" 
                        strokeWidth={3}
                        name="New Tenants"
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
                  Subscription Tiers
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tierDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tier" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#a67c00" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tenants Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  All Tenants
                </Typography>
                <Button variant="contained" size="small">
                  Export Data
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
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
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Subscription Tier"
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">All Tiers</MenuItem>
                    <MenuItem value="free">Free</MenuItem>
                    <MenuItem value="starter">Starter</MenuItem>
                    <MenuItem value="pro">Pro</MenuItem>
                    <MenuItem value="enterprise">Enterprise</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Business Name</TableCell>
                    <TableCell>Subscription</TableCell>
                    <TableCell align="right">Invoices</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="center">Users</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTenants.map((tenant) => {
                    const stats = tenantStats[tenant.id];
                    return (
                      <TableRow key={tenant.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {tenant.business_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tenant.subscription_tier}
                            color={getSubscriptionTierColor(tenant.subscription_tier)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {stats?.total_invoices || 0}
                        </TableCell>
                        <TableCell align="right">
                          {getCurrencyFlag('GHS')} {formatCurrency(stats?.total_revenue || 0, 'GHS')}
                        </TableCell>
                        <TableCell align="center">
                          {stats?.active_users || 0}
                        </TableCell>
                        <TableCell>
                          {new Date(tenant.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tenant.is_active ? 'Active' : 'Inactive'}
                            color={tenant.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton size="small">
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <BlockIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredTenants.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No tenants found matching your criteria.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
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
