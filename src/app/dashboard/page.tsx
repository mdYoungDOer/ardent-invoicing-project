'use client';

export const dynamic = 'force-dynamic';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
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
  CircularProgress
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  AccountCircle as AccountCircleIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
  subscription_tier: string;
  invoice_quota_used: number;
}

interface Tenant {
  id: string;
  business_name: string;
}

export default function Dashboard() {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        if (userData.role !== 'sme') {
          router.push('/login');
          return;
        }

        setUser(userData);

        // Fetch tenant data
        if (userData.tenant_id) {
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', userData.tenant_id)
            .single();

          if (tenantError) throw tenantError;
          setTenant(tenantData);
        }

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

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

  const getQuotaLimit = (tier: string) => {
    switch (tier) {
      case 'free': return 2;
      case 'starter': return 20;
      case 'pro': return 400;
      case 'enterprise': return 999999;
      default: return 2;
    }
  };

  const quotaLimit = getQuotaLimit(user?.subscription_tier || 'free');
  const quotaUsed = user?.invoice_quota_used || 0;
  const quotaPercentage = (quotaUsed / quotaLimit) * 100;

  const stats = [
    {
      title: 'Invoices This Month',
      value: quotaUsed,
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      subtitle: `${quotaLimit === 999999 ? 'Unlimited' : `${quotaUsed}/${quotaLimit}`} invoices`
    },
    {
      title: 'Total Revenue',
      value: '₵0',
      icon: <MoneyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      subtitle: 'This month'
    },
    {
      title: 'Pending Invoices',
      value: '0',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      subtitle: 'Awaiting payment'
    },
    {
      title: 'Clients',
      value: '0',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      subtitle: 'Active clients'
    }
  ];

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
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome back, {user?.email}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here&apos;s what&apos;s happening with your business today.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {stat.icon}
                    <Typography variant="h4" component="div" sx={{ ml: 2, fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quota Usage */}
        {user?.subscription_tier === 'free' && (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                Invoice Quota Usage
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {quotaUsed} of {quotaLimit} invoices used
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(quotaPercentage)}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.min(quotaPercentage, 100)}%`,
                      height: '100%',
                      bgcolor: quotaPercentage > 80 ? 'error.main' : 'primary.main',
                      transition: 'width 0.3s ease-in-out'
                    }}
                  />
                </Box>
              </Box>
              {quotaPercentage > 80 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  You&apos;re running low on invoice quota. Consider upgrading your plan to continue creating invoices.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={quotaUsed >= quotaLimit}
                    sx={{
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      }
                    }}
                  >
                    Create New Invoice
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    View All Invoices
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUpIcon />}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    Track Expenses
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No recent activity to display.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Create your first invoice to get started!
                  </Typography>
                </Box>
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
