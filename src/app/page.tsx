'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card,
  CardContent,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Stack,
  Divider
} from '@mui/material';
import { Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <Header currentPath="/" />

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
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
                  </motion.div>
                </Stack>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              >
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
              </motion.div>
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flexGrow: 1,
                    p: 0
                  }}>
                    <Box sx={{ mb: 2, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 2,
                        minHeight: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        flexGrow: 1,
                        lineHeight: 1.6,
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
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
                    
                    <Box sx={{ mb: 3, flexGrow: 1 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <Box key={featureIndex} sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          mb: 1.5,
                          textAlign: 'left'
                        }}>
                          <CheckIcon sx={{ color: 'success.main', mr: 1, fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              lineHeight: 1.4,
                              wordBreak: 'break-word'
                            }}
                          >
                            {feature}
                          </Typography>
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
                        mt: 'auto',
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
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flexGrow: 1,
                    p: 0
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        src={testimonial.avatar}
                        sx={{ width: 56, height: 56, mr: 2, flexShrink: 0 }}
                      />
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            lineHeight: 1.2,
                            wordBreak: 'break-word'
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            lineHeight: 1.3,
                            wordBreak: 'break-word'
                          }}
                        >
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontStyle: 'italic', 
                        mb: 2,
                        flexGrow: 1,
                        lineHeight: 1.6,
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      "{testimonial.content}"
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 'auto' }}>
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
      <Footer />
    </Box>
  );
}