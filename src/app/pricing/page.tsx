'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  Button,
  Chip,
  AppBar,
  Toolbar,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_PLANS, BILLING_INTERVALS, calculatePrice, getDiscountAmount, formatCurrency } from '@/lib/subscription-plans';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const router = useRouter();
  const [selectedInterval, setSelectedInterval] = useState('monthly');
  const [isAnnual, setIsAnnual] = useState(false);

  const handleGetStarted = (planId: string) => {
    if (planId === 'free') {
      router.push('/signup?plan=free');
    } else {
      router.push(`/signup?plan=${planId}&interval=${selectedInterval}`);
    }
  };

  const toggleBilling = () => {
    setIsAnnual(!isAnnual);
    setSelectedInterval(isAnnual ? 'monthly' : 'annual');
  };

  const getPlanPrice = (plan: any) => {
    const interval = isAnnual ? 'annual' : selectedInterval;
    return calculatePrice(plan, interval);
  };

  const getPlanDiscount = (plan: any) => {
    const interval = isAnnual ? 'annual' : selectedInterval;
    return getDiscountAmount(plan, interval);
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Ardent Invoicing
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/login')}
            sx={{ mr: 2 }}
          >
            Sign In
          </Button>
          <Button 
            variant="contained" 
            onClick={() => router.push('/signup')}
            sx={{ bgcolor: 'primary.main' }}
          >
            Get Started
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Choose the perfect plan for your business. Start free and upgrade anytime. 
              All plans include our core features with no hidden fees.
            </Typography>
            
            {/* Billing Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <Typography variant="body1" sx={{ color: !isAnnual ? 'primary.main' : 'text.secondary', fontWeight: !isAnnual ? 600 : 400 }}>
                Monthly
              </Typography>
              <Switch
                checked={isAnnual}
                onChange={toggleBilling}
                sx={{ mx: 2 }}
              />
              <Typography variant="body1" sx={{ color: isAnnual ? 'primary.main' : 'text.secondary', fontWeight: isAnnual ? 600 : 400 }}>
                Annual
              </Typography>
              {isAnnual && (
                <Chip 
                  label="Save up to 20%" 
                  color="success" 
                  size="small" 
                  sx={{ ml: 2 }} 
                />
              )}
            </Box>
          </Box>
        </motion.div>

        {/* Pricing Cards */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const price = getPlanPrice(plan);
            const discount = getPlanDiscount(plan);
            const monthlyPrice = plan.price.monthly;
            
            return (
              <Grid item xs={12} md={6} lg={3} key={plan.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      border: plan.popular ? 2 : 1,
                      borderColor: plan.popular ? 'primary.main' : 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: plan.popular 
                          ? '0 12px 40px rgba(166, 124, 0, 0.3)' 
                          : '0 8px 30px rgba(0, 0, 0, 0.15)',
                      }
                    }}
                  >
                    {plan.popular && (
                      <Box sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                        <Chip
                          label="Most Popular"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    )}
                    
                    <CardContent sx={{ p: 4, pb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: plan.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2
                          }}
                        >
                          <StarIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {plan.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {plan.description}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                          {plan.id === 'free' ? 'Free' : formatCurrency(price)}
                        </Typography>
                        {plan.id !== 'free' && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {isAnnual ? 'per year' : `per ${selectedInterval}`}
                            </Typography>
                            {discount > 0 && (
                              <Chip
                                label={`Save ${formatCurrency(discount)}`}
                                color="success"
                                size="small"
                              />
                            )}
                          </Box>
                        )}
                        {plan.id !== 'free' && isAnnual && (
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(monthlyPrice)} per month
                          </Typography>
                        )}
                      </Box>
                      
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 3, color: 'primary.main' }}>
                        {plan.invoiceLimit === 999999 ? 'Unlimited' : `${plan.invoiceLimit} invoices per month`}
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        {plan.features.map((feature, featureIndex) => (
                          <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20, mr: 1.5, mt: 0.1 }} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 4, pt: 0 }}>
                      <Button
                        variant={plan.popular ? 'contained' : 'outlined'}
                        fullWidth
                        size="large"
                        onClick={() => handleGetStarted(plan.id)}
                        sx={{
                          py: 1.5,
                          bgcolor: plan.popular ? 'primary.main' : 'transparent',
                          borderColor: plan.popular ? 'primary.main' : 'primary.main',
                          color: plan.popular ? 'white' : 'primary.main',
                          '&:hover': {
                            bgcolor: plan.popular ? 'primary.dark' : 'primary.main',
                            color: 'white',
                          }
                        }}
                      >
                        {plan.id === 'free' ? 'Get Started Free' : `Choose ${plan.name}`}
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Compare All Features
            </Typography>
            <Typography variant="body1" color="text.secondary">
              See what's included in each plan
            </Typography>
          </Box>
          
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                      Features
                    </th>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <th key={plan.id} style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e0e0e', minWidth: '150px' }}>
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Invoices per month', values: ['2', '20', '400', 'Unlimited'] },
                    { feature: 'Expense tracking', values: ['Basic', 'Advanced', 'Advanced', 'Advanced'] },
                    { feature: 'Multi-currency support', values: ['GHS only', 'All currencies', 'All currencies', 'All currencies'] },
                    { feature: 'PDF generation', values: ['❌', '✅', '✅', '✅'] },
                    { feature: 'Analytics & reporting', values: ['Basic', 'Basic', 'Advanced', 'Advanced'] },
                    { feature: 'Custom templates', values: ['❌', '❌', '✅', '✅'] },
                    { feature: 'Team collaboration', values: ['1 user', '1 user', 'Up to 5 users', 'Unlimited users'] },
                    { feature: 'API access', values: ['❌', '❌', 'Basic', 'Full'] },
                    { feature: 'Client portal', values: ['❌', '❌', '✅', '✅'] },
                    { feature: 'Recurring invoices', values: ['❌', '❌', '✅', '✅'] },
                    { feature: 'Priority support', values: ['Email', 'Email', 'Email + Chat', 'Dedicated'] },
                    { feature: 'Custom integrations', values: ['❌', '❌', '❌', '✅'] },
                  ].map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>
                        {row.feature}
                      </td>
                      {row.values.map((value, valueIndex) => (
                        <td key={valueIndex} style={{ padding: '16px', textAlign: 'center' }}>
                          {value === '✅' ? (
                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          ) : value === '❌' ? (
                            <Typography variant="body2" color="text.disabled">—</Typography>
                          ) : (
                            <Typography variant="body2">{value}</Typography>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
              Trusted by Ghanaian SMEs
            </Typography>
            
            <Grid container spacing={4} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <SecurityIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bank-Grade Security
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Your data is protected with enterprise-level security and encryption.
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Lightning Fast
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Create and send invoices in seconds with our optimized platform.
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <SupportIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    24/7 Support
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Get help when you need it with our dedicated support team.
                </Typography>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography variant="body2">
                <strong>🇬🇭 Built for Ghana:</strong> All payments are processed in Ghana Cedis (GHS) 
                with local payment methods including mobile money and bank transfers.
              </Typography>
            </Alert>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}