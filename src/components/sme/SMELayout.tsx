'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AttachMoney as PaymentIcon,
  People as CustomersIcon,
  Message as MessageIcon,
  Inventory as ProductIcon,
  Receipt as InvoiceIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Keyboard as KeyboardIcon,
  Diamond as DiamondIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

const DRAWER_WIDTH = 280;

interface SMELayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function SMELayout({ children, title }: SMELayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const { user, tenant } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
      localStorage.removeItem('ardent_user');
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      active: title === 'Dashboard'
    },
    {
      title: 'Payment',
      icon: <PaymentIcon />,
      path: '/dashboard/payments',
      active: false
    },
    {
      title: 'Customers',
      icon: <CustomersIcon />,
      path: '/dashboard/customers',
      active: false
    },
    {
      title: 'Message',
      icon: <MessageIcon />,
      path: '/dashboard/messages',
      active: false,
      badge: 8
    },
  ];

  const toolsItems = [
    {
      title: 'Product',
      icon: <ProductIcon />,
      path: '/dashboard/products',
      active: false
    },
    {
      title: 'Invoice',
      icon: <InvoiceIcon />,
      path: '/dashboard/invoices',
      active: title === 'Invoices'
    },
    {
      title: 'Expenses',
      icon: <ReceiptIcon />,
      path: '/dashboard/expenses',
      active: title === 'Expenses'
    },
    {
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/dashboard/analytics',
      active: false
    },
    {
      title: 'Automation',
      icon: <SettingsIcon />,
      path: '/dashboard/automation',
      active: false,
      badge: 'BETA'
    },
  ];

  const supportItems = [
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      path: '/dashboard/settings',
      active: false
    },
    {
      title: 'Security',
      icon: <SecurityIcon />,
      path: '/dashboard/security',
      active: false
    },
    {
      title: 'Help',
      icon: <HelpIcon />,
      path: '/dashboard/help',
      active: false
    },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Ardent Invoicing"
          sx={{
            height: 48,
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))',
            }
          }}
        />
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        {/* General Section */}
        <Typography variant="caption" sx={{ px: 3, py: 1, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          General
        </Typography>
        <List sx={{ px: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: item.active ? 'primary.main' : 'transparent',
                  color: item.active ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: item.active ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.active ? 'white' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  primaryTypographyProps={{ fontWeight: item.active ? 600 : 400 }}
                />
                {item.badge && (
                  <Badge 
                    badgeContent={item.badge} 
                    color="error" 
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        fontSize: '0.75rem',
                        height: 20,
                        minWidth: 20,
                        ...(typeof item.badge === 'string' && {
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontSize: '0.625rem',
                          height: 16,
                          minWidth: 32,
                        })
                      } 
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Tools Section */}
        <Typography variant="caption" sx={{ px: 3, py: 1, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mt: 3, display: 'block' }}>
          Tools
        </Typography>
        <List sx={{ px: 2 }}>
          {toolsItems.map((item) => (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: item.active ? 'primary.main' : 'transparent',
                  color: item.active ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: item.active ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.active ? 'white' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  primaryTypographyProps={{ fontWeight: item.active ? 600 : 400 }}
                />
                {item.badge && (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    sx={{ 
                      height: 20,
                      fontSize: '0.625rem',
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Support Section */}
        <Typography variant="caption" sx={{ px: 3, py: 1, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mt: 3, display: 'block' }}>
          Support
        </Typography>
        <List sx={{ px: 2 }}>
          {supportItems.map((item) => (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: item.active ? 'primary.main' : 'transparent',
                  color: item.active ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: item.active ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.active ? 'white' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  primaryTypographyProps={{ fontWeight: item.active ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Bottom Section */}
      <Box sx={{ p: 2 }}>
        {/* Team Marketing Card */}
        <Box sx={{ 
          bgcolor: 'grey.50', 
          borderRadius: 2, 
          p: 2, 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <DiamondIcon sx={{ color: 'success.main', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
              {tenant?.business_name || 'Team Marketing'}
            </Typography>
            <IconButton size="small" onClick={() => setTeamMenuOpen(!teamMenuOpen)}>
              {teamMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {user?.subscription_tier?.toUpperCase() || 'FREE'} Plan
          </Typography>
        </Box>

        {/* Upgrade Button */}
        <Button 
          variant="contained" 
          fullWidth 
          sx={{ 
            mb: 2,
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          Upgrade Plan
        </Button>

        {/* Copyright */}
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
          @2024 Ardent Invoicing, Inc.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          backdropFilter: 'blur(8px)',
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important', px: 3 }}>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page Title */}
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            mr: 3,
            display: { xs: 'none', sm: 'block' }
          }}>
            {title}
          </Typography>

          {/* Search Bar */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'grey.50', 
            borderRadius: 3, 
            px: 3, 
            py: 1.5,
            flexGrow: 1,
            maxWidth: 500,
            mr: 3,
            border: '1px solid',
            borderColor: 'grey.200',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'grey.300',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: '0 0 0 3px rgba(166, 124, 0, 0.1)',
            }
          }}>
            <SearchIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
              Search invoices, customers, expenses...
            </Typography>
            <Box sx={{ 
              bgcolor: 'grey.100', 
              borderRadius: 1.5, 
              px: 1.5, 
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <KeyboardIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary' }}>
                ⌘K
              </Typography>
            </Box>
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Notifications */}
            <IconButton 
              color="inherit"
              sx={{
                position: 'relative',
                '&:hover': {
                  bgcolor: 'grey.100',
                }
              }}
            >
              <Badge badgeContent={3} color="error" sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: 18,
                  minWidth: 18,
                }
              }}>
                <NotificationsIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>

            {/* Quick Actions */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              sx={{
                borderColor: 'grey.300',
                color: 'text.primary',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                }
              }}
            >
              Quick Add
            </Button>

            {/* User Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <Box sx={{ textAlign: 'right', mr: 2, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {user?.email?.split('@')[0] || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {tenant?.business_name || 'Business'}
                </Typography>
              </Box>
              <IconButton 
                onClick={handleProfileMenuOpen}
                sx={{
                  border: '2px solid',
                  borderColor: 'grey.200',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Box>

            {/* Profile Menu */}
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
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                }
              }}
            >
              <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
                <AccountCircleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Profile Settings
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
                <SettingsIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Preferences
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 2 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Sign Out
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'grey.50',
          pt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
