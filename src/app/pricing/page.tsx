'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
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
import { Grid } from '@mui/material';
import { 
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PricingPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <Header currentPath="/pricing" />

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
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card 
                  elevation={plan.popular ? 8 : 2}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
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
                        fontWeight: 600,
                        zIndex: 1
                      }} 
                    />
                  )}
                  <CardContent sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    height: '100%'
                  }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                        {plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {plan.period}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 3,
                          minHeight: '2.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {plan.description}
                      </Typography>
                    </Box>
                    
                    <List sx={{ 
                      textAlign: 'left', 
                      mb: 3, 
                      flexGrow: 1,
                      '& .MuiListItem-root': {
                        px: 0,
                        py: 0.5
                      }
                    }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              sx: {
                                lineHeight: 1.4,
                                wordBreak: 'break-word'
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Button 
                      onClick={() => {
                        if (plan.name === 'Enterprise') {
                          router.push('/contact');
                        } else {
                          router.push(`/signup?plan=${plan.name.toLowerCase()}&first_visit=true`);
                        }
                      }}
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      sx={{ 
                        mt: 'auto',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        py: 1.5,
                        boxShadow: plan.popular ? 4 : 2,
                        '&:hover': {
                          boxShadow: 8,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        },
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
              <Grid size={{ xs: 12, md: 6 }} key={index}>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Can I change plans anytime?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Is there a free trial?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes, all paid plans come with a 14-day free trial. No credit card required.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Do you support GHS currency?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Absolutely! All plans include full GHS support with Ghana-specific tax calculations.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
      <Footer />
    </Box>
  );
}