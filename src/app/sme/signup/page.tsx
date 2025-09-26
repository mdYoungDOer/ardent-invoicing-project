'use client';

export const dynamic = 'force-dynamic';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SmeSignup() {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: ''
  });

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
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

    // Validate business name
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      setLoading(false);
      return;
    }

    try {
      console.log('🏢 SME Signup: Creating business account...');
      console.log('Email:', formData.email);
      console.log('Business:', formData.businessName);
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      console.log('✅ Auth user created, ID:', authData.user.id);

      // Create tenant first
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          business_name: formData.businessName,
          sme_user_id: authData.user.id
        })
        .select()
        .single();

      if (tenantError) {
        console.error('❌ Tenant creation error:', tenantError);
        throw tenantError;
      }

      console.log('✅ Tenant created, ID:', tenantData.id);

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

      if (userError) {
        console.error('❌ User creation error:', userError);
        throw userError;
      }

      console.log('✅ SME user record created');

      setSuccess('Business account created successfully! Please check your email to verify your account.');
      
      // Redirect to SME login after 3 seconds
      setTimeout(() => {
        router.push('/sme/login');
      }, 3000);

    } catch (error: any) {
      console.error('❌ SME signup error:', error);
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton component={Link} href="/" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            SME Portal
          </Typography>
          <IconButton onClick={toggleTheme} color="inherit">
            {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* SME Signup Form */}
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Create Business Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start managing your invoices and expenses today
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSmeSignup}>
            <TextField
              fullWidth
              label="Business Name"
              value={formData.businessName}
              onChange={handleInputChange('businessName')}
              margin="normal"
              required
              autoFocus
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Business Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              margin="normal"
              required
              autoComplete="email"
              disabled={loading}
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
              disabled={loading}
              helperText="Must be at least 6 characters long"
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
              disabled={loading}
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
              {loading ? <CircularProgress size={24} /> : 'Create Business Account'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link href="/sme/login" style={{ color: '#a67c00', textDecoration: 'none', fontWeight: 600 }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 Ardent Invoicing. All rights reserved. Powered by Mega Web Services
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
