'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card,
  CardContent,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { Grid } from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  CloudUpload as CloudUploadIcon,
  PhoneAndroid as MobileIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function FeaturesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mainFeatures = [
    {
      icon: <ReceiptIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: "Smart Invoicing",
      description: "Create professional invoices in seconds with our intuitive interface. Support for GHS and multiple currencies with automatic tax calculations.",
      features: [
        "Professional invoice templates",
        "GHS currency support",
        "Automatic tax calculations",
        "Custom branding",
        "Payment reminders",
        "Recurring invoices"
      ],
      image: "/images/electronic-invoice-being-processed-digitally-highlighting-convenience-efficiency-modern.jpg"
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: "Expense Tracking",
      description: "Track business expenses with receipt scanning, categorization, and detailed reporting. Perfect for Ghanaian tax compliance.",
      features: [
        "Receipt scanning with OCR",
        "Automatic categorization",
        "Mileage tracking",
        "Tax compliance reports",
        "Expense analytics",
        "Receipt storage"
      ],
      image: "/images/closeup-business-man-checking-tax-invoice-paper.jpg"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: "Bank-Level Security",
      description: "Your data is protected with enterprise-grade security. GDPR compliant with Ghana-specific data residency options.",
      features: [
        "End-to-end encryption",
        "GDPR compliance",
        "Data backup & recovery",
        "Role-based access",
        "Audit trails",
        "Secure payments"
      ],
      image: "/images/african-american-man-with-face-mask-analyzing-documents-plan-marketing-strategy-company-employee-working-with-laptop-doing-paperwork-project-coronavirus-pandemic.jpg"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: "Lightning Fast",
      description: "Optimized for speed and performance. Generate invoices, track expenses, and manage your business in real-time.",
      features: [
        "Real-time updates",
        "Offline capability",
        "Fast loading times",
        "Mobile optimization",
        "Bulk operations",
        "Quick search & filter"
      ],
      image: "/images/high-angle-shot-unrecognizable-young-man-sitting-table-front-laptop-taking-online-orders.jpg"
    }
  ];

  const additionalFeatures = [
    {
      icon: <PaymentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Payment Processing",
      description: "Accept payments directly through your invoices with integrated payment gateways."
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Cloud Storage",
      description: "Secure cloud storage for all your business documents and receipts."
    },
    {
      icon: <MobileIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Mobile App",
      description: "Manage your business on the go with our mobile app for iOS and Android."
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Team Collaboration",
      description: "Work together with your team with role-based access and permissions."
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "24/7 Support",
      description: "Get help when you need it with our dedicated support team."
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Advanced Analytics",
      description: "Get insights into your business with detailed reports and analytics."
    }
  ];

  const testimonials = [
    {
      name: "Kwame Asante",
      role: "CEO, TechStart Ghana",
      content: "Ardent Invoicing transformed our business operations. We can now track expenses and generate invoices in minutes, not hours.",
      avatar: "/images/black-businessman-using-computer-laptop.jpg",
      rating: 5
    },
    {
      name: "Ama Serwaa",
      role: "Founder, Serwaa's Boutique",
      content: "The GHS integration is perfect for our business. We can invoice in Ghana Cedis and our clients love the professional look.",
      avatar: "/images/shoulder-view-blackwoman-sitting-table-with-bills-calculator-reading-receipt.jpg",
      rating: 5
    },
    {
      name: "Kofi Mensah",
      role: "Director, Mensah & Associates",
      content: "The expense tracking feature saved us countless hours. Receipt scanning is a game-changer for our accounting process.",
      avatar: "/images/male-manager-reviewing-data-clipboard.jpg",
      rating: 5
    }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Header currentPath="/features" />

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
              Powerful Features for Ghanaian SMEs
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
              Everything you need to manage your business finances professionally. 
              Built specifically for Ghanaian businesses with GHS support and local compliance.
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

      {/* Main Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          {mainFeatures.map((feature, index) => (
            <Box key={index} sx={{ mb: { xs: 8, md: 12 } }}>
              <Grid container spacing={6} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }} order={{ xs: index % 2 === 0 ? 1 : 2, md: index % 2 === 0 ? 1 : 2 }}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                      {feature.description}
                    </Typography>
                    <Grid container spacing={2}>
                      {feature.features.map((item, featureIndex) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={featureIndex}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckIcon sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                            <Typography variant="body2">{item}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} order={{ xs: index % 2 === 0 ? 2 : 1, md: index % 2 === 0 ? 2 : 1 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Image
                      src={feature.image}
                      alt={feature.title}
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
            </Box>
          ))}
        </Container>
      </Box>

      {/* Additional Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              And Much More
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Additional features to help you manage every aspect of your business finances.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {additionalFeatures.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
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
                        WebkitLineClamp: 3,
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
                      {[...Array(testimonial.rating)].map((_, i) => (
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
              Ready to Experience These Features?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Start your free trial today and see how Ardent Invoicing can transform your business
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