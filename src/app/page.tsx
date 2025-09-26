'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import Link from 'next/link';

export default function Home() {
  const { theme: nextTheme, setTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const features = [
    {
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Multi-Currency Invoices (GHS Default)',
      description: 'Create professional invoices in Ghana Cedis with support for multiple currencies. Automated numbering and customizable templates.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Auto-VAT & Reports',
      description: 'Automatically calculate VAT, generate comprehensive reports, and track your business performance with real-time analytics.'
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure & Compliant',
      description: 'Bank-level security with full compliance to Ghanaian tax regulations. Your data is protected and backed up securely.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Lightning Fast',
      description: 'Built for speed and efficiency. Create invoices in seconds, track expenses on the go, and get paid faster.'
    }
  ];

  const testimonials = [
    {
      name: 'Kwame Asante',
      business: 'Asante Trading Ltd',
      text: 'Ardent Invoicing has transformed how we handle our billing. The GHS integration is seamless and our clients love the professional invoices.'
    },
    {
      name: 'Ama Serwaa',
      business: 'Serwaa Consultancy',
      text: 'The expense tracking feature has saved us hours every week. Now we can focus on growing our business instead of managing paperwork.'
    },
    {
      name: 'Kofi Mensah',
      business: 'Mensah Logistics',
      text: 'As a small business owner, I needed something affordable yet powerful. Ardent Invoicing delivers exactly what we need.'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Ardent Invoicing
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} href="/features" sx={{ color: 'text.primary' }}>
              Features
            </Button>
            <Button color="inherit" component={Link} href="/pricing" sx={{ color: 'text.primary' }}>
              Pricing
            </Button>
            <Button color="inherit" component={Link} href="/about" sx={{ color: 'text.primary' }}>
              About
            </Button>
            <Button variant="outlined" component={Link} href="/login" sx={{ color: 'primary.main', borderColor: 'primary.main' }}>
              Login
            </Button>
            <Button variant="contained" component={Link} href="/signup" sx={{ bgcolor: 'primary.main' }}>
              Get Started
            </Button>
            <IconButton onClick={toggleTheme} color="inherit">
              {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #a67c00 0%, #ffffff 100%)',
          py: { xs: 8, md: 12 },
          minHeight: { xs: '70vh', md: '80vh' },
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 3,
                  lineHeight: 1.2
                }}
              >
                Empower Your{' '}
                <Typography
                  component="span"
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #a67c00 0%, #746354 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Ghanaian SME
                </Typography>
              </Typography>
              <Typography
                variant="h5"
                component="p"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  lineHeight: 1.6
                }}
              >
                Invoice in GHS, Track Expenses Seamlessly – Get Paid Faster
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/signup"
                  sx={{
                    bgcolor: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/pricing"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      color: 'primary.dark'
                    }
                  }}
                >
                  View Pricing
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 300, md: 400 },
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  Dashboard Preview Coming Soon
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Why Choose Ardent Invoicing?
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 6,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Built specifically for Ghanaian SMEs with features that matter most to your business
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Trusted by Ghanaian SMEs
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'background.paper',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                      &ldquo;{testimonial.text}&rdquo;
                    </Typography>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.business}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #746354 0%, #9a8577 100%)',
          py: { xs: 8, md: 12 },
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: 'white'
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography
              variant="h6"
              component="p"
              sx={{
                mb: 4,
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              Join hundreds of Ghanaian SMEs who trust Ardent Invoicing to manage their finances
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/signup"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                Ardent Invoicing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Empowering Ghanaian SMEs with professional invoicing and expense management solutions.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 4 }}>
                <Button color="inherit" component={Link} href="/features" sx={{ color: 'text.primary' }}>
                  Features
                </Button>
                <Button color="inherit" component={Link} href="/pricing" sx={{ color: 'text.primary' }}>
                  Pricing
                </Button>
                <Button color="inherit" component={Link} href="/about" sx={{ color: 'text.primary' }}>
                  About
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Ardent Invoicing. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
