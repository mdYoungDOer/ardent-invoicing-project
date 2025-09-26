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
  Paper
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import Link from 'next/link';

export default function LoginPortal() {
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Ardent Invoicing
          </Typography>
          <IconButton onClick={toggleTheme} color="inherit">
            {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Portal Selection */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            Choose Your Portal
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Select the appropriate portal based on your role to access your dashboard
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', maxWidth: 1000, mx: 'auto' }}>
          {/* SME Portal */}
          <Box sx={{ flex: 1, maxWidth: 500 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <BusinessIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                  SME Portal
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  For small and medium enterprises to manage invoices, expenses, and business operations
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  component={Link}
                  href="/sme/login"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  SME Login
                </Button>
                <Button
                  component={Link}
                  href="/sme/signup"
                  variant="outlined"
                  size="large"
                  fullWidth
                >
                  SME Sign Up
                </Button>
              </Box>

              <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  <strong>Features:</strong> Invoice management, expense tracking, client management, reporting
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Admin Portal */}
          <Box sx={{ flex: 1, maxWidth: 500 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <SecurityIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
                <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
                  Admin Portal
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  For platform administrators to manage users, monitor system health, and oversee operations
                </Typography>
              </Box>

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
                  Admin Login
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
                  Admin Sign Up
                </Button>
              </Box>

              <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  <strong>Features:</strong> User management, system monitoring, analytics, platform configuration
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Security Notice */}
        <Box sx={{ mt: 6, p: 3, bgcolor: 'warning.light', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="warning.contrastText">
            <strong>Security Notice:</strong> Admin access is restricted to authorized personnel only. 
            Unauthorized access attempts will be logged and monitored.
          </Typography>
        </Box>
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
