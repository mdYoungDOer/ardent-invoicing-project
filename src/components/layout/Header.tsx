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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    // Initial check
    handleScroll();

    // Add scroll listener with proper options
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also listen for resize events to handle mobile scroll issues
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
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
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Ardent Invoicing"
              sx={{
                width: 40,
                height: 40,
                marginRight: 1,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </Link>
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
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: 'text.primary',
              bgcolor: 'rgba(166, 124, 0, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(166, 124, 0, 0.2)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
            aria-label="Toggle theme"
          >
            {nextTheme === 'dark' ? <LightModeIcon sx={{ color: '#ffd700' }} /> : <DarkModeIcon sx={{ color: '#2c2c2c' }} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 4 : 0} 
        sx={{ 
          bgcolor: scrolled ? 'background.paper' : 'transparent',
          borderBottom: scrolled ? 1 : 0, 
          borderColor: 'divider',
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
          background: scrolled 
            ? (nextTheme === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)')
            : 'transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1100,
          top: 0,
          left: 0,
          right: 0
        }}
      >
        <Toolbar sx={{ 
          py: scrolled ? 0.5 : 1, 
          px: { xs: 1, md: 2 },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Logo - Clickable Link to Homepage */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Ardent Invoicing"
                sx={{
                  width: scrolled ? 40 : 60,
                  height: scrolled ? 40 : 60,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </Link>
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
            sx={{ 
              mr: 2,
              color: 'text.primary',
              bgcolor: 'rgba(166, 124, 0, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(166, 124, 0, 0.2)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
            aria-label="Toggle theme"
          >
            {nextTheme === 'dark' ? <LightModeIcon sx={{ color: '#ffd700' }} /> : <DarkModeIcon sx={{ color: '#2c2c2c' }} />}
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
