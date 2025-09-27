'use client';

import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  onMenuClick?: () => void;
  mobileOpen?: boolean;
}

export default function AdminLayout({ 
  children, 
  title, 
  user, 
  onMenuClick, 
  mobileOpen 
}: AdminLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <AdminSidebar user={user} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          ml: { md: '280px' }, // Account for sidebar width
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="fixed"
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            ml: { md: '280px' },
            width: { md: 'calc(100% - 280px)' },
            zIndex: theme.zIndex.drawer + 1,
            height: '64px', // Fixed height
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important', height: '64px' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={onMenuClick}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                flexGrow: 1,
              }}
            >
              {title}
            </Typography>

            {/* Time period selector placeholder */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.875rem',
            }}>
              Time period:
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            pt: '80px', // Increased padding to account for fixed header
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
