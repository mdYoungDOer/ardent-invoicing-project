'use client';

import { 
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface HeaderProps {
  currentPath?: string;
}

export default function Header({ currentPath = '/' }: HeaderProps) {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' }
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Image 
            src="/logo.png" 
            alt="Ardent Invoicing" 
            width={32} 
            height={32}
            style={{ marginRight: 8 }}
          />
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              component={Link} 
              href={item.href}
              selected={currentPath === item.href}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button 
          component={Link} 
          href="/sme/login" 
          variant="outlined" 
          fullWidth
          sx={{ mb: 1 }}
        >
          Sign In
        </Button>
        <Button 
          component={Link} 
          href="/sme/signup" 
          variant="contained"
          fullWidth
          sx={{ 
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          Get Started
        </Button>
      </Box>
    </Box>
  );

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: 'background.paper', 
          borderBottom: 1, 
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.8)',
          '&.MuiAppBar-root': {
            background: nextTheme === 'dark' ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)'
          }
        }}
      >
        <Toolbar sx={{ py: 2, px: { xs: 2, md: 4 } }}>
          {/* Logo - Standalone */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Image 
              src="/logo.png" 
              alt="Ardent Invoicing" 
              width={48} 
              height={48}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                transition: 'transform 0.3s ease'
              }}
            />
          </Box>
          
          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 3 }}>
            {navigationItems.map((item) => (
              <Button 
                key={item.label}
                component={Link} 
                href={item.href} 
                color="inherit"
                sx={{
                  fontWeight: currentPath === item.href ? 600 : 400,
                  color: currentPath === item.href ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'rgba(166, 124, 0, 0.1)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Theme Toggle */}
          <IconButton 
            onClick={toggleTheme} 
            color="inherit" 
            sx={{ mr: 2 }}
            aria-label="Toggle theme"
          >
            {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Desktop Auth Buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button 
              component={Link} 
              href="/sme/login" 
              variant="outlined" 
              sx={{ 
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'rgba(166, 124, 0, 0.1)'
                }
              }}
            >
              Sign In
            </Button>
            <Button 
              component={Link} 
              href="/sme/signup" 
              variant="contained"
              sx={{ 
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Get Started
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250 
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
