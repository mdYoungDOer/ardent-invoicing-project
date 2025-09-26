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
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Chip
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Check as CheckIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import { useState } from 'react';
import Link from 'next/link';

export default function Pricing() {
  const { theme: nextTheme, setTheme } = useNextTheme();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const pricingTiers = [
    {
      name: 'Free',
      price: { monthly: 0, quarterly: 0, yearly: 0 },
      currency: '₵',
      period: { monthly: 'mo', quarterly: 'mo', yearly: 'mo' },
      description: 'Perfect for getting started',
      features: [
        '2 invoices per month',
        'Basic expense tracking',
        'GHS currency support',
        'Email support',
        'Mobile app access'
      ],
      limitations: [
        'Limited to 2 invoices',
        'Basic reporting only'
      ],
      cta: 'Start Free',
      ctaVariant: 'outlined' as const,
      popular: false
    },
    {
      name: 'Starter',
      price: { monthly: 129, quarterly: 115, yearly: 99 },
      currency: '₵',
      period: { monthly: 'mo', quarterly: 'mo', yearly: 'mo' },
      description: 'Ideal for growing SMEs',
      features: [
        '20 invoices per month',
        'Advanced expense tracking',
        'Multi-currency support',
        'VAT calculations',
        'Basic reporting',
        'Priority email support',
        'Mobile app access',
        'Custom invoice templates'
      ],
      limitations: [],
      cta: 'Start Starter Plan',
      ctaVariant: 'contained' as const,
      popular: true
    },
    {
      name: 'Pro',
      price: { monthly: 489, quarterly: 439, yearly: 389 },
      currency: '₵',
      period: { monthly: 'mo', quarterly: 'mo', yearly: 'mo' },
      description: 'For established businesses',
      features: [
        '400 invoices per month',
        'Advanced expense management',
        'Multi-currency support',
        'Automated VAT calculations',
        'Advanced reporting & analytics',
        'Priority phone support',
        'Mobile app access',
        'Custom branding',
        'API access',
        'Team collaboration (up to 5 users)'
      ],
      limitations: [],
      cta: 'Start Pro Plan',
      ctaVariant: 'contained' as const,
      popular: false
    },
    {
      name: 'Enterprise',
      price: { monthly: 999, quarterly: 899, yearly: 799 },
      currency: '₵',
      period: { monthly: 'mo', quarterly: 'mo', yearly: 'mo' },
      description: 'For large enterprises',
      features: [
        'Unlimited invoices',
        'Full expense management suite',
        'Multi-currency support',
        'Automated VAT & tax compliance',
        'Advanced reporting & analytics',
        '24/7 phone support',
        'Mobile app access',
        'Full custom branding',
        'Full API access',
        'Unlimited team members',
        'White-label options',
        'Dedicated account manager'
      ],
      limitations: [],
      cta: 'Contact Sales',
      ctaVariant: 'contained' as const,
      popular: false
    }
  ];

  const getCurrentPrice = (tier: typeof pricingTiers[0]) => {
    return tier.price[billingCycle];
  };

  const getCurrentPeriod = (tier: typeof pricingTiers[0]) => {
    return tier.period[billingCycle];
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Ardent Invoicing
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} href="/" sx={{ color: 'text.primary' }}>
              Home
            </Button>
            <Button color="inherit" component={Link} href="/features" sx={{ color: 'text.primary' }}>
              Features
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
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
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
              Simple, Transparent Pricing
            </Typography>
            <Typography
              variant="h5"
              component="p"
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.6,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Choose the perfect plan for your Ghanaian SME. Start free, scale as you grow.
            </Typography>
            
            {/* Billing Cycle Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
              <ToggleButtonGroup
                value={billingCycle}
                exclusive
                onChange={(_, value) => value && setBillingCycle(value)}
                sx={{
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    px: 3,
                    py: 1,
                    border: 'none',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="monthly">Monthly</ToggleButton>
                <ToggleButton value="quarterly">Quarterly</ToggleButton>
                <ToggleButton value="yearly">Yearly</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Pricing Cards */}
          <Grid container spacing={4} justifyContent="center">
            {pricingTiers.map((tier, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: tier.popular ? 2 : 1,
                    borderColor: tier.popular ? 'primary.main' : 'divider',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  {tier.popular && (
                    <Chip
                      icon={<StarIcon />}
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h4" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {tier.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {tier.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                        <Typography variant="h3" component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {tier.currency}{getCurrentPrice(tier)}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                          /{getCurrentPeriod(tier)}
                        </Typography>
                      </Box>
                      {billingCycle === 'quarterly' && (
                        <Typography variant="caption" color="success.main">
                          Save 11% vs monthly
                        </Typography>
                      )}
                      {billingCycle === 'yearly' && (
                        <Typography variant="caption" color="success.main">
                          Save 23% vs monthly
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ flexGrow: 1, mb: 4 }}>
                      <Box sx={{ mb: 2 }}>
                        {tier.features.map((feature, featureIndex) => (
                          <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckIcon sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
                            <Typography variant="body2" color="text.primary">
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      {tier.limitations.length > 0 && (
                        <Box>
                          {tier.limitations.map((limitation, limitationIndex) => (
                            <Typography key={limitationIndex} variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              • {limitation}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Button
                      variant={tier.ctaVariant}
                      size="large"
                      fullWidth
                      component={Link}
                      href={tier.name === 'Enterprise' ? '/contact' : '/signup'}
                      sx={{
                        ...(tier.ctaVariant === 'contained' && {
                          bgcolor: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        }),
                        ...(tier.ctaVariant === 'outlined' && {
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '&:hover': {
                            borderColor: 'primary.dark',
                            color: 'primary.dark'
                          }
                        })
                      }}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* FAQ Section */}
          <Box sx={{ mt: 12, textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                mb: 6,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                      Can I change my plan anytime?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                      What payment methods do you accept?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      We accept all major credit cards, mobile money (MTN, Vodafone, AirtelTigo), and bank transfers for Ghanaian customers.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                      Is there a free trial?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Yes! Start with our Free plan and upgrade when you're ready. No credit card required to get started.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                      Do you offer custom enterprise plans?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Absolutely! Contact our sales team for custom pricing and features tailored to your enterprise needs.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
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
                <Button color="inherit" component={Link} href="/" sx={{ color: 'text.primary' }}>
                  Home
                </Button>
                <Button color="inherit" component={Link} href="/features" sx={{ color: 'text.primary' }}>
                  Features
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
