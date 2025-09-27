'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Subscriptions as SubscriptionsIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  AccountCircle as ProfileIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';

const drawerWidth = 280;

interface AdminSidebarProps {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const navigationItems = [
  {
    title: 'DASHBOARD',
    items: [
      { label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Tenants', icon: BusinessIcon, path: '/admin/tenants' },
      { label: 'Subscriptions', icon: SubscriptionsIcon, path: '/admin/subscriptions' },
      { label: 'Users', icon: PeopleIcon, path: '/admin/users' },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Settings', icon: SettingsIcon, path: '/admin/settings' },
      { label: 'Profile', icon: ProfileIcon, path: '/admin/profile' },
    ]
  }
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { theme: currentTheme, setTheme } = useNextTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem('ardent_admin');
    
    // Redirect to login
    window.location.replace('/admin/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Ardent Invoicing"
            sx={{
              width: 32,
              height: 32,
              mr: 2,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Ardent Admin
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {navigationItems.map((section) => (
          <Box key={section.title} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                px: 3,
                py: 1,
                display: 'block',
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {section.title}
            </Typography>
            <List>
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                const IconComponent = item.icon;
                
                return (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        mx: 2,
                        mb: 0.5,
                        borderRadius: 2,
                        bgcolor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'white' : 'text.primary',
                        '&:hover': {
                          bgcolor: isActive ? 'primary.dark' : 'action.hover',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: 40,
                        color: isActive ? 'white' : 'text.secondary',
                      }}>
                        <IconComponent />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          fontSize: '0.95rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Dark Mode Toggle */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <FormControlLabel
          control={
            <Switch
              checked={currentTheme === 'dark'}
              onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              Dark mode
            </Typography>
          }
        />
      </Box>

      {/* User Profile */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ 
            width: 40, 
            height: 40, 
            mr: 2,
            bgcolor: 'primary.main',
            fontSize: '1rem',
          }}>
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.email || 'Super Admin'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
              Admin Manager
            </Typography>
          </Box>
        </Box>
        
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'error.contrastText',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Log out"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
}
