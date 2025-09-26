'use client';

export const dynamic = 'force-dynamic';

import { 
  Box, 
  Container, 
  Typography, 
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Alert
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import Link from 'next/link';

export default function AdminAccess() {
  const { theme: nextTheme, setTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton component={Link} href="/" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'error.main' }}>
            🔒 Admin Access
          </Typography>
          <IconButton onClick={toggleTheme} color="inherit">
            {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Admin Access Form */}
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SecurityIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
              🔒 Administrative Access
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Restricted access for authorized platform administrators only
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 4 }}>
            <Typography variant="body2">
              <strong>Security Notice:</strong> This area is restricted to authorized personnel only. 
              Unauthorized access attempts are logged and monitored. All activities are recorded for security purposes.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              component={Link}
              href="/admin/login"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                bgcolor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
            >
              🔐 Admin Login
            </Button>
            <Button
              component={Link}
              href="/admin/signup"
              variant="outlined"
              size="large"
              fullWidth
              sx={{
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  bgcolor: 'error.light'
                }
              }}
            >
              👤 Create Admin Account
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 1, border: 1, borderColor: 'error.light' }}>
            <Typography variant="body2" color="error.main" sx={{ textAlign: 'center', fontWeight: 600 }}>
              <WarningIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
              Authorized Personnel Only
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
              If you are not an authorized administrator, please use the{' '}
              <Link href="/sme/login" style={{ color: '#a67c00', textDecoration: 'none', fontWeight: 600 }}>
                SME Portal
              </Link>{' '}
              instead.
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
