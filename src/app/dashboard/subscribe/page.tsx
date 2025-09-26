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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { SUBSCRIPTION_PLANS, BILLING_INTERVALS, calculatePrice, getDiscountAmount, formatCurrency } from '@/lib/subscription-plans';
import { motion } from 'framer-motion';

export default function SubscribePage() {
  const router = useRouter();
  const { user, tenant } = useAppStore();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [selectedInterval, setSelectedInterval] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const steps = [
    'Choose Plan',
    'Select Billing',
    'Payment',
    'Confirmation'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    if (planId === 'free') {
      // Skip to confirmation for free plan
      setActiveStep(3);
    } else {
      handleNext();
    }
  };

  const handleSubscribe = async () => {
    if (selectedPlan === 'free') {
      // Handle free plan subscription
      await handleFreeSubscription();
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          interval: selectedInterval,
          userEmail: user?.email,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.authorization_url) {
          // Redirect to Paystack
          window.location.href = data.authorization_url;
        } else {
          // Free plan confirmation
          setActiveStep(3);
        }
      } else {
        setError(data.error || 'Subscription failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFreeSubscription = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'free',
          interval: 'monthly',
          userEmail: user?.email,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setActiveStep(3);
      } else {
        setError(data.error || 'Failed to activate free plan');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlanData = SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan);
  const price = selectedPlanData ? calculatePrice(selectedPlanData, selectedInterval) : 0;
  const discount = selectedPlanData ? getDiscountAmount(selectedPlanData, selectedInterval) : 0;

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton component="div" onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Upgrade Your Plan
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Progress Stepper */}
        <Box sx={{ mb: 6 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Step 1: Choose Plan */}
          {activeStep === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 600 }}>
                Choose Your Plan
              </Typography>
              <Grid container spacing={3}>
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <Grid item xs={12} md={6} lg={3} key={plan.id}>
                    <Card
                      sx={{
                        height: '100%',
                        position: 'relative',
                        cursor: 'pointer',
                        border: selectedPlan === plan.id ? 2 : 1,
                        borderColor: selectedPlan === plan.id ? 'primary.main' : 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px rgba(166, 124, 0, 0.25)',
                        }
                      }}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {plan.popular && (
                        <Chip
                          label="Most Popular"
                          color="primary"
                          size="small"
                          sx={{ position: 'absolute', top: 16, right: 16 }}
                        />
                      )}
                      
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: plan.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}
                          >
                            <StarIcon sx={{ color: 'white' }} />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {plan.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          {plan.description}
                        </Typography>
                        
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                          {plan.id === 'free' ? 'Free' : `${formatCurrency(plan.price.monthly)}/mo`}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          {plan.invoiceLimit === 999999 ? 'Unlimited' : `${plan.invoiceLimit} invoices/month`}
                        </Typography>
                        
                        <Box>
                          {plan.features.map((feature, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16, mr: 1 }} />
                              <Typography variant="body2">{feature}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {/* Step 2: Select Billing */}
          {activeStep === 1 && selectedPlan !== 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 600 }}>
                Choose Billing Interval
              </Typography>
              
              <Card sx={{ p: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                    Billing Frequency
                  </FormLabel>
                  <RadioGroup
                    value={selectedInterval}
                    onChange={(e) => setSelectedInterval(e.target.value)}
                  >
                    {BILLING_INTERVALS.map((interval) => {
                      const intervalPrice = selectedPlanData ? calculatePrice(selectedPlanData, interval.id) : 0;
                      const intervalDiscount = selectedPlanData ? getDiscountAmount(selectedPlanData, interval.id) : 0;
                      
                      return (
                        <Card
                          key={interval.id}
                          sx={{
                            mb: 2,
                            cursor: 'pointer',
                            border: selectedInterval === interval.id ? 2 : 1,
                            borderColor: selectedInterval === interval.id ? 'primary.main' : 'divider',
                          }}
                          onClick={() => setSelectedInterval(interval.id)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel
                                  value={interval.id}
                                  control={<Radio />}
                                  label={
                                    <Box>
                                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {interval.label}
                                      </Typography>
                                      {interval.discount > 0 && (
                                        <Chip
                                          label={`Save ${interval.discount}%`}
                                          color="success"
                                          size="small"
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </Box>
                                  }
                                  sx={{ m: 0 }}
                                />
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {formatCurrency(intervalPrice)}
                                </Typography>
                                {intervalDiscount > 0 && (
                                  <Typography variant="body2" color="text.secondary">
                                    Save {formatCurrency(intervalDiscount)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              </Card>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ bgcolor: 'primary.main' }}
                >
                  Continue to Payment
                </Button>
              </Box>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {activeStep === 2 && selectedPlan !== 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 600 }}>
                Complete Your Subscription
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Order Summary
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Plan:</Typography>
                        <Typography sx={{ fontWeight: 600 }}>
                          {selectedPlanData?.name} ({selectedInterval})
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Amount:</Typography>
                        <Typography sx={{ fontWeight: 600 }}>
                          {formatCurrency(price)}
                        </Typography>
                      </Box>
                      
                      {discount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography color="success.main">Discount:</Typography>
                          <Typography color="success.main" sx={{ fontWeight: 600 }}>
                            -{formatCurrency(discount)}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {formatCurrency(price)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Payment Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <CreditCardIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        Secure payment powered by Paystack
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <SecurityIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Your payment information is encrypted and secure
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleSubscribe}
                      disabled={isProcessing}
                      sx={{ bgcolor: 'primary.main', py: 1.5 }}
                    >
                      {isProcessing ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        `Pay ${formatCurrency(price)} with Paystack`
                      )}
                    </Button>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
              </Box>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {activeStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                  {selectedPlan === 'free' ? 'Free Plan Activated!' : 'Subscription Successful!'}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                  {selectedPlan === 'free' 
                    ? 'Your free plan is now active. You can create up to 2 invoices per month.'
                    : `Your ${selectedPlanData?.name} plan has been activated. You now have access to all premium features.`
                  }
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/dashboard')}
                  sx={{ bgcolor: 'primary.main' }}
                >
                  Go to Dashboard
                </Button>
              </Box>
            </motion.div>
          )}
        </Box>
      </Container>
    </Box>
  );
}
