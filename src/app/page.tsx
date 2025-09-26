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
  CardMedia,
  Chip,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Divider
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
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

  const features = [
    {
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Smart Invoicing",
      description: "Create professional invoices in seconds with our intuitive interface. Support for GHS and multiple currencies."
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Expense Tracking",
      description: "Track business expenses with receipt scanning, categorization, and detailed reporting."
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Secure & Compliant",
      description: "Bank-level security with Ghana tax compliance. Your data is safe and your business stays compliant."
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Lightning Fast",
      description: "Optimized for speed. Generate invoices, track expenses, and manage your business in real-time."
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "₵0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "2 invoices per month",
        "Basic expense tracking",
        "Email support",
        "Mobile app access"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Starter",
      price: "₵129",
      period: "per month",
      description: "Ideal for growing businesses",
      features: [
        "20 invoices per month",
        "Advanced expense tracking",
        "Priority support",
        "Custom branding",
        "Payment reminders"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Pro",
      price: "₵489",
      period: "per month",
      description: "For established businesses",
      features: [
        "400 invoices per month",
        "Advanced analytics",
        "Team collaboration",
        "API access",
        "Custom integrations"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Enterprise",
      price: "₵999",
      period: "per month",
      description: "For large organizations",
      features: [
        "Unlimited invoices",
        "White-label solution",
        "Dedicated support",
        "Custom development",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Kwame Asante",
      role: "CEO, TechStart Ghana",
      content: "Ardent Invoicing transformed our business operations. We can now track expenses and generate invoices in minutes, not hours.",
      avatar: "/images/black-businessman-using-computer-laptop.jpg"
    },
    {
      name: "Ama Serwaa",
      role: "Founder, Serwaa's Boutique",
      content: "The GHS integration is perfect for our business. We can invoice in Ghana Cedis and our clients love the professional look.",
      avatar: "/images/shoulder-view-blackwoman-sitting-table-with-bills-calculator-reading-receipt.jpg"
    },
    {
      name: "Kofi Mensah",
      role: "Director, Mensah & Associates",
      content: "The expense tracking feature saved us countless hours. Receipt scanning is a game-changer for our accounting process.",
      avatar: "/images/male-manager-reviewing-data-clipboard.jpg"
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
            <Button component={Link} href="/features" color="inherit">
              Features
            </Button>
            <Button component={Link} href="/pricing" color="inherit">
              Pricing
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
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
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
                Invoice & Expense Management for Ghanaian SMEs
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                Streamline your business finances with professional invoicing, 
                expense tracking, and payment management. Built specifically for Ghanaian businesses.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                  href="/features" 
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
                  Learn More
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <Image
                  src="/images/night-man-home-office-with-documents-laptop-paperwork-desk-deadline-overtime-as-accountant-male-person-remote-work-entrepreneur-with-company-financial-report-statement.jpg"
                  alt="Professional invoicing dashboard"
                  width={600}
                  height={400}
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    width: '100%',
                    height: 'auto'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Everything You Need to Manage Your Business
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Powerful features designed specifically for Ghanaian SMEs to streamline 
              invoicing, expense tracking, and financial management.
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

      {/* Pricing Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Choose the plan that fits your business. All plans include GHS support and mobile access.
            </Typography>
          </Box>

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
                    
                    <Box sx={{ mb: 3 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckIcon sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>

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

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Trusted by Ghanaian Businesses
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              See what our customers say about Ardent Invoicing
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={2} sx={{ height: '100%', p: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        src={testimonial.avatar}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                      ))}
                    </Box>
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
          background: 'linear-gradient(135deg, #a67c00 0%, #746354 100%)',
          color: 'white',
          py: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Ready to Transform Your Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of Ghanaian businesses already using Ardent Invoicing
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
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                '&:hover': { 
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Your Free Trial
            </Button>
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton sx={{ color: 'white' }}>
                  <PhoneIcon />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                  <EmailIcon />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                  <LocationIcon />
                </IconButton>
              </Box>
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