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
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
      id={`signup-tabpanel-${index}`}
      aria-labelledby={`signup-tab-${index}`}
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

function SignupContent() {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    fullName: ''
  });

  // Handle plan parameter from pricing page
  useEffect(() => {
    const plan = searchParams.get('plan');
    
    if (plan) {
      setSelectedPlan(plan);
      // Auto-focus on SME signup if coming from pricing
      if (plan !== 'enterprise') {
        setTabValue(1);
      }
    }
  }, [searchParams]);

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handleSmeSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create tenant and user record
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          business_name: formData.businessName,
          sme_user_id: authData.user.id
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          role: 'sme',
          tenant_id: tenantData.id,
          subscription_tier: 'free'
        });

      if (userError) throw userError;

      setSuccess('Account created successfully! Please check your email to verify your account.');
      
      // Redirect to dashboard with onboarding parameters
      setTimeout(() => {
        router.push(`/dashboard?first_visit=true&plan=${selectedPlan}`);
      }, 3000);

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Super admin password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create super admin user record (no subscription attributes needed)
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          role: 'super'
          // Super admins don't need subscription_tier, is_unlimited_free, etc.
          // They have platform-wide access by default
        });

      if (userError) throw userError;

      setSuccess('Super admin account created successfully! Please check your email to verify your account.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
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

      {/* Signup Form */}
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ maxWidth: 500, mx: 'auto' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="signup tabs">
                <Tab label="SME Signup" />
                <Tab label="Super Admin Signup" />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" sx={{ m: 3, mb: 0 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ m: 3, mb: 0 }}>
                {success}
              </Alert>
            )}

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                Start Your SME Journey
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Create your business account and start invoicing in minutes
              </Typography>
              
              <Box component="form" onSubmit={handleSmeSignup}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange('fullName')}
                  margin="normal"
                  required
                  autoComplete="name"
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Business Name"
                  value={formData.businessName}
                  onChange={handleInputChange('businessName')}
                  margin="normal"
                  required
                  autoComplete="organization"
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  margin="normal"
                  required
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  margin="normal"
                  required
                  autoComplete="new-password"
                  helperText="Minimum 6 characters"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  margin="normal"
                  required
                  autoComplete="new-password"
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
                  {loading ? <CircularProgress size={24} /> : 'Create SME Account'}
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                Super Admin Registration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Create an administrative account to manage the platform
              </Typography>
              
              <Box component="form" onSubmit={handleSuperAdminSignup}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange('fullName')}
                  margin="normal"
                  required
                  autoComplete="name"
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Admin Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  margin="normal"
                  required
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  margin="normal"
                  required
                  autoComplete="new-password"
                  helperText="Minimum 8 characters"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  margin="normal"
                  required
                  autoComplete="new-password"
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
                  {loading ? <CircularProgress size={24} /> : 'Create Admin Account'}
                </Button>
              </Box>
            </TabPanel>

            <Box sx={{ p: 3, pt: 0, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#a67c00', textDecoration: 'none', fontWeight: 600 }}>
                  Sign in here
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

export default function Signup() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
