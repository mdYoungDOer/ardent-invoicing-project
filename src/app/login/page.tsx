'use client';

export const dynamic = 'force-dynamic';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField,
  Card,
  CardContent,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`login-tabpanel-${index}`}
      aria-labelledby={`login-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Login() {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: ''
  });

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const handleSmeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Check if user has SME role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      if (userData.role !== 'sme') {
        throw new Error('Access denied. This account is not authorized for SME access.');
      }

      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Starting super admin login...');
      console.log('Email:', formData.email);
      
      // Step 1: Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('❌ Supabase auth error:', authError);
        throw authError;
      }

      console.log('✅ Auth successful, user ID:', authData.user?.id);

      // Step 2: Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Check user role
      console.log('🔍 Checking user role...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, id, email')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('❌ User data fetch error:', userError);
        throw new Error('Unable to verify user permissions. Please try again.');
      }

      console.log('✅ User data:', userData);

      if (userData.role !== 'super') {
        throw new Error('Access denied. This account is not authorized for super admin access.');
      }

      console.log('✅ Super admin role confirmed, redirecting...');
      
      // Step 4: Force redirect with full page reload
      setTimeout(() => {
        window.location.replace('/admin/dashboard');
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton component={Link} href="/" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Ardent Invoicing
          </Typography>
          <IconButton onClick={toggleTheme} color="inherit">
            {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Login Form */}
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ maxWidth: 500, mx: 'auto' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="login tabs">
                <Tab label="SME Login" />
                <Tab label="Super Admin Login" />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" sx={{ m: 3, mb: 0 }}>
                {error}
              </Alert>
            )}

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                Welcome Back, SME
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Sign in to your business account to manage invoices and expenses
              </Typography>
              
              <Box component="form" onSubmit={handleSmeLogin}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  margin="normal"
                  required
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  margin="normal"
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                Super Admin Access
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Administrative access to manage the platform
              </Typography>
              
              <Box component="form" onSubmit={handleSuperAdminLogin}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  margin="normal"
                  required
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  margin="normal"
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Admin Sign In'}
                </Button>
              </Box>
            </TabPanel>

            <Box sx={{ p: 3, pt: 0, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link href="/signup" style={{ color: '#a67c00', textDecoration: 'none', fontWeight: 600 }}>
                  Sign up here
                </Link>
              </Typography>
            </Box>
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
