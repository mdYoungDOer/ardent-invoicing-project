'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PricingPage() {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const pricingPlans = [
    {
      name: "Free",
      price: "₵0",
      period: "forever",
      description: "Perfect for getting started with basic invoicing needs",
      features: [
        "2 invoices per month",
        "Basic expense tracking",
        "Email support",
        "Mobile app access",
        "GHS currency support",
        "Basic reporting"
      ],
      cta: "Get Started Free",
      popular: false,
      color: "grey"
    },
    {
      name: "Starter",
      price: "₵129",
      period: "per month",
      description: "Ideal for growing businesses that need more invoicing capacity",
      features: [
        "20 invoices per month",
        "Advanced expense tracking",
        "Priority support",
        "Custom branding",
        "Payment reminders",
        "Basic analytics",
        "Receipt scanning",
        "Team collaboration (2 users)"
      ],
      cta: "Start Free Trial",
      popular: true,
      color: "primary"
    },
    {
      name: "Pro",
      price: "₵489",
      period: "per month",
      description: "For established businesses with advanced needs",
      features: [
        "400 invoices per month",
        "Advanced analytics & reporting",
        "Team collaboration (10 users)",
        "API access",
        "Custom integrations",
        "Advanced receipt scanning",
        "Multi-currency support",
        "Automated workflows",
        "Priority phone support"
      ],
      cta: "Start Free Trial",
      popular: false,
      color: "secondary"
    },
    {
      name: "Enterprise",
      price: "₵999",
      period: "per month",
      description: "For large organizations with unlimited needs",
      features: [
        "Unlimited invoices",
        "White-label solution",
        "Dedicated support manager",
        "Custom development",
        "SLA guarantee",
        "Advanced security features",
        "Custom integrations",
        "Unlimited team members",
        "24/7 phone support"
      ],
      cta: "Contact Sales",
      popular: false,
      color: "warning"
    }
  ];

  const features = [
    {
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Professional Invoicing",
      description: "Create beautiful, branded invoices in seconds"
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Expense Tracking",
      description: "Track and categorize business expenses with ease"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Bank-Level Security",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "24/7 Support",
      description: "Get help when you need it with our dedicated support team"
    }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
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
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Image 
              src="/logo.png" 
              alt="Ardent Invoicing" 
              width={40} 
              height={40}
              style={{ marginRight: 12 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Ardent Invoicing
            </Typography>
          </Box>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mr: 3 }}>
            <Button component={Link} href="/" color="inherit">
              Home
            </Button>
            <Button component={Link} href="/features" color="inherit">
              Features
            </Button>
            <Button component={Link} href="/about" color="inherit">
              About
            </Button>
          </Box>

          <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 2 }}>
            {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Button 
            component={Link} 
            href="/sme/login" 
            variant="outlined" 
            sx={{ mr: 1 }}
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
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #a67c00 0%, #746354 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Choose the plan that fits your business. All plans include GHS support, 
              mobile access, and our commitment to your success.
            </Typography>
            <Button 
              component={Link} 
              href="/sme/signup" 
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                px: 4,
                py: 1.5,
                '&:hover': { 
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  elevation={plan.popular ? 8 : 2}
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? 2 : 0,
                    borderColor: 'primary.main',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {plan.popular && (
                    <Chip 
                      label="Most Popular" 
                      color="primary" 
                      sx={{ 
                        position: 'absolute', 
                        top: -12, 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        fontWeight: 600
                      }} 
                    />
                  )}
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.period}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                    
                    <List sx={{ textAlign: 'left', mb: 3 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Button 
                      component={Link} 
                      href={plan.name === 'Enterprise' ? '/contact' : '/sme/signup'}
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      sx={{ 
                        mt: 2,
                        ...(plan.popular && {
                          bgcolor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.dark' }
                        })
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Everything Included in Every Plan
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              All our plans come with essential features to help you manage your business finances effectively.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
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

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Get answers to common questions about our pricing and features.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Can I change plans anytime?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Is there a free trial?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes, all paid plans come with a 14-day free trial. No credit card required.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Do you support GHS currency?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Absolutely! All plans include full GHS support with Ghana-specific tax calculations.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  What payment methods do you accept?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We accept all major credit cards, mobile money, and bank transfers in Ghana.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #a67c00 0%, #746354 100%)',
          color: 'white',
          py: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of Ghanaian businesses already using Ardent Invoicing
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button 
                component={Link} 
                href="/sme/signup" 
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Free Trial
              </Button>
              <Button 
                component={Link} 
                href="/contact" 
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                Contact Sales
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Image 
                  src="/logo.png" 
                  alt="Ardent Invoicing" 
                  width={32} 
                  height={32}
                  style={{ marginRight: 12 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Ardent Invoicing
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                Empowering Ghanaian SMEs with professional invoicing and expense management solutions.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Product
              </Typography>
              <Stack spacing={1}>
                <Link href="/features" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Features</Typography>
                </Link>
                <Link href="/pricing" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Pricing</Typography>
                </Link>
                <Link href="/security" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Security</Typography>
                </Link>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1}>
                <Link href="/about" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">About</Typography>
                </Link>
                <Link href="/contact" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Contact</Typography>
                </Link>
                <Link href="/careers" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Careers</Typography>
                </Link>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Support
              </Typography>
              <Stack spacing={1}>
                <Link href="/help" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Help Center</Typography>
                </Link>
                <Link href="/docs" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Documentation</Typography>
                </Link>
                <Link href="/status" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Status</Typography>
                </Link>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Link href="/privacy" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Privacy</Typography>
                </Link>
                <Link href="/terms" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Terms</Typography>
                </Link>
                <Link href="/cookies" style={{ color: 'white', textDecoration: 'none' }}>
                  <Typography variant="body2">Cookies</Typography>
                </Link>
              </Stack>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2025 Ardent Invoicing. All rights reserved. Powered by Mega Web Services
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}