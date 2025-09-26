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

export default function SmeLogin() {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleSmeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🏢 SME Login: Starting authentication...');
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

      // Step 2: Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Verify SME role
      console.log('🔍 Verifying SME role...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, tenant_id, id, email')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('❌ User data fetch error:', userError);
        throw new Error('Unable to verify user permissions. Please try again.');
      }

      console.log('✅ User data:', userData);

      if (userData.role !== 'sme') {
        // Sign out the user if they're not an SME
        await supabase.auth.signOut();
        throw new Error('Access denied. This account is not authorized for SME access.');
      }

      console.log('✅ SME role confirmed, redirecting...');
      
      // Step 4: Force redirect to SME dashboard
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('❌ SME login error:', error);
      setError(error.message || 'An error occurred during login');
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

      {/* SME Login Form */}
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              SME Login
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Access your business dashboard and manage invoices
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSmeLogin}>
            <TextField
              fullWidth
              label="Business Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
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
              autoComplete="current-password"
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
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link href="/sme/signup" style={{ color: '#a67c00', textDecoration: 'none', fontWeight: 600 }}>
                Sign up here
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
