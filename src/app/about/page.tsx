'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid,
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
import { 
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const values = [
    {
      icon: <BusinessIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: "Empowering Ghanaian SMEs",
      description: "We believe in the power of Ghanaian businesses and are committed to providing tools that help them thrive in the digital economy."
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: "Security First",
      description: "Your business data is precious. We implement bank-level security measures to protect your financial information and ensure compliance."
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: "Innovation & Speed",
      description: "We continuously innovate to provide the fastest, most efficient tools for managing your business finances."
    },
    {
      icon: <SupportIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: "Customer Success",
      description: "Your success is our success. We provide dedicated support to ensure you get the most out of our platform."
    }
  ];

  const team = [
    {
      name: "Kwame Asante",
      role: "CEO & Founder",
      description: "Former fintech executive with 10+ years experience in African markets",
      avatar: "/images/black-businessman-using-computer-laptop.jpg"
    },
    {
      name: "Ama Serwaa",
      role: "CTO",
      description: "Software engineer specializing in financial technology and security",
      avatar: "/images/shoulder-view-blackwoman-sitting-table-with-bills-calculator-reading-receipt.jpg"
    },
    {
      name: "Kofi Mensah",
      role: "Head of Product",
      description: "Product strategist with deep understanding of SME needs in Ghana",
      avatar: "/images/male-manager-reviewing-data-clipboard.jpg"
    }
  ];

  const stats = [
    { number: "500+", label: "Ghanaian SMEs" },
    { number: "₵2M+", label: "Invoices Processed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Header currentPath="/about" />

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
              About Ardent Invoicing
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
              We're on a mission to empower Ghanaian SMEs with professional 
              financial management tools that are built for the local market.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
                  Our Mission
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                  To democratize financial management for Ghanaian SMEs by providing 
                  accessible, professional, and locally-relevant tools that help businesses 
                  grow and succeed in the digital economy.
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  Founded in 2024, Ardent Invoicing was born from a simple observation: 
                  Ghanaian SMEs were struggling with outdated, expensive, or foreign 
                  financial management tools that didn't understand local business needs.
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  We set out to change that by building a platform specifically designed 
                  for Ghanaian businesses, with GHS support, local tax compliance, and 
                  features that matter to our market.
                </Typography>
                <Button 
                  component={Link} 
                  href="/sme/signup" 
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  Join Our Mission
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <Image
                  src="/images/night-man-home-office-with-documents-laptop-paperwork-desk-deadline-overtime-as-accountant-male-person-remote-work-entrepreneur-with-company-financial-report-statement.jpg"
                  alt="Our mission in action"
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

      {/* Values Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Our Values
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              The principles that guide everything we do at Ardent Invoicing
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 4,
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
                    <Box sx={{ mb: 3, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {value.icon}
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
                      {value.title}
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
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Our Impact
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Numbers that show our commitment to Ghanaian SMEs
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Meet Our Team
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              The passionate people behind Ardent Invoicing
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
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
                    <Avatar 
                      src={member.avatar}
                      sx={{ width: 120, height: 120, mx: 'auto', mb: 3 }}
                    />
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                      {member.role}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Get in Touch
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Have questions or want to learn more? We'd love to hear from you.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <PhoneIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Phone
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +233 20 123 4567
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <EmailIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Email
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  hello@ardentinvoicing.com
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <LocationIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Location
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accra, Ghana
                </Typography>
              </Card>
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
              Ready to Join Our Mission?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Start your free trial today and experience the difference of locally-built financial tools
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