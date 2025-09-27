'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Avatar,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

// Form validation schemas
const businessInfoSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(1, 'Please select a business type'),
  industry: z.string().min(1, 'Please select an industry'),
  businessSize: z.string().min(1, 'Please select business size'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter a valid address'),
});

const profileSetupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  jobTitle: z.string().min(1, 'Please enter your job title'),
  experience: z.string().min(1, 'Please select your experience level'),
});

const preferencesSchema = z.object({
  currency: z.string().min(1, 'Please select your primary currency'),
  fiscalYearStart: z.string().min(1, 'Please select fiscal year start'),
  invoicePrefix: z.string().min(1, 'Please enter invoice prefix'),
  timezone: z.string().min(1, 'Please select your timezone'),
});

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user: any;
  tenant: any;
}

export default function OnboardingWizard({ isOpen, onClose, onComplete, user, tenant }: OnboardingWizardProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const { setTenant } = useAppStore();

  // Form hooks
  const businessForm = useForm({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: tenant?.business_name || '',
      businessType: '',
      industry: '',
      businessSize: '',
      phoneNumber: tenant?.phone_number || '',
      address: tenant?.address || '',
    }
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      jobTitle: '',
      experience: '',
    }
  });

  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      currency: 'GHS',
      fiscalYearStart: 'January',
      invoicePrefix: 'INV',
      timezone: 'Africa/Accra',
    }
  });

  const steps = [
    {
      label: 'Business Information',
      icon: <BusinessIcon />,
      description: 'Tell us about your business',
      color: 'primary'
    },
    {
      label: 'Profile Setup',
      icon: <PersonIcon />,
      description: 'Complete your profile',
      color: 'secondary'
    },
    {
      label: 'Preferences',
      icon: <ReceiptIcon />,
      description: 'Configure your settings',
      color: 'success'
    },
    {
      label: 'Get Started',
      icon: <CheckIcon />,
      description: 'Ready to create your first invoice',
      color: 'warning'
    }
  ];

  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'Limited Liability Company (LLC)',
    'Corporation',
    'Non-Profit',
    'Other'
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Education',
    'Retail',
    'Manufacturing',
    'Construction',
    'Professional Services',
    'Consulting',
    'Real Estate',
    'Finance',
    'Food & Beverage',
    'Transportation',
    'Other'
  ];

  const businessSizes = [
    '1-5 employees',
    '6-20 employees',
    '21-50 employees',
    '51-200 employees',
    '200+ employees'
  ];

  const experienceLevels = [
    'New to invoicing',
    'Some experience',
    'Experienced',
    'Very experienced'
  ];

  const currencies = [
    { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  const handleNext = async () => {
    setError('');
    
    try {
      // Validate current step
      let isValid = false;
      
      switch (activeStep) {
        case 0:
          isValid = await businessForm.trigger();
          if (isValid) {
            await saveBusinessInfo();
          }
          break;
        case 1:
          isValid = await profileForm.trigger();
          if (isValid) {
            await saveProfileInfo();
          }
          break;
        case 2:
          isValid = await preferencesForm.trigger();
          if (isValid) {
            await savePreferences();
          }
          break;
        default:
          isValid = true;
      }

      if (isValid) {
        setCompletedSteps(prev => [...prev, activeStep]);
        setActiveStep(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const saveBusinessInfo = async () => {
    const data = businessForm.getValues();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          business_name: data.businessName,
          business_type: data.businessType,
          industry: data.industry,
          business_size: data.businessSize,
          phone_number: data.phoneNumber,
          address: data.address,
          onboarding_completed: false, // Will be true after all steps
        })
        .eq('id', tenant?.id);

      if (error) throw error;

      // Update local store
      setTenant({
        ...tenant,
        business_name: data.businessName,
        business_type: data.businessType,
        industry: data.industry,
        business_size: data.businessSize,
        phone_number: data.phoneNumber,
        address: data.address,
      });
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfileInfo = async () => {
    const data = profileForm.getValues();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.fullName,
          job_title: data.jobTitle,
          experience_level: data.experience,
        })
        .eq('id', user?.id);

      if (error) throw error;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    const data = preferencesForm.getValues();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          primary_currency: data.currency,
          fiscal_year_start: data.fiscalYearStart,
          invoice_prefix: data.invoicePrefix,
          timezone: data.timezone,
          onboarding_completed: true,
        })
        .eq('id', tenant?.id);

      if (error) throw error;

      // Update local store
      setTenant({
        ...tenant,
        primary_currency: data.currency,
        fiscal_year_start: data.fiscalYearStart,
        invoice_prefix: data.invoicePrefix,
        timezone: data.timezone,
        onboarding_completed: true,
      });
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    router.push('/dashboard/invoices/new?onboarding=true');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tell us about your business
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This information helps us customize your experience
            </Typography>

            <Stack spacing={3}>
              <Controller
                name="businessName"
                control={businessForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Business Name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    placeholder="Enter your business name"
                    aria-label="Business name"
                    aria-describedby={fieldState.error ? "business-name-error" : "business-name-help"}
                  />
                )}
              />

              <Controller
                name="businessType"
                control={businessForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Business Type</InputLabel>
                    <Select 
                      {...field} 
                      label="Business Type"
                      aria-label="Business type"
                    >
                      {businessTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="industry"
                control={businessForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Industry</InputLabel>
                    <Select {...field} label="Industry">
                      {industries.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="businessSize"
                control={businessForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Business Size</InputLabel>
                    <Select {...field} label="Business Size">
                      {businessSizes.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="phoneNumber"
                control={businessForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    placeholder="+233 XX XXX XXXX"
                  />
                )}
              />

              <Controller
                name="address"
                control={businessForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Business Address"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    placeholder="Enter your business address"
                  />
                )}
              />
            </Stack>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Complete your profile
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Help us personalize your dashboard experience
            </Typography>

            <Stack spacing={3}>
              <Controller
                name="fullName"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    placeholder="Enter your full name"
                  />
                )}
              />

              <Controller
                name="jobTitle"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Job Title"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    placeholder="e.g., CEO, Manager, Owner"
                  />
                )}
              />

              <Controller
                name="experience"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Experience Level</InputLabel>
                    <Select {...field} label="Experience Level">
                      {experienceLevels.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configure your preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set up your default settings for invoices and accounting
            </Typography>

            <Stack spacing={3}>
              <Controller
                name="currency"
                control={preferencesForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Primary Currency</InputLabel>
                    <Select {...field} label="Primary Currency">
                      {currencies.map((currency) => (
                        <MenuItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="fiscalYearStart"
                control={preferencesForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Fiscal Year Start</InputLabel>
                    <Select {...field} label="Fiscal Year Start">
                      {[
                        'January', 'February', 'March', 'April',
                        'May', 'June', 'July', 'August',
                        'September', 'October', 'November', 'December'
                      ].map((month) => (
                        <MenuItem key={month} value={month}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="invoicePrefix"
                control={preferencesForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Invoice Prefix"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    placeholder="INV"
                    inputProps={{ maxLength: 5 }}
                  />
                )}
              />

              <Controller
                name="timezone"
                control={preferencesForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Timezone</InputLabel>
                    <Select {...field} label="Timezone">
                      <MenuItem value="Africa/Accra">Africa/Accra (GMT+0)</MenuItem>
                      <MenuItem value="Africa/Lagos">Africa/Lagos (GMT+1)</MenuItem>
                      <MenuItem value="Europe/London">Europe/London (GMT+0/+1)</MenuItem>
                      <MenuItem value="America/New_York">America/New_York (GMT-5/-4)</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'success.main',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <CheckIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </motion.div>

            <Typography variant="h4" gutterBottom>
              Welcome to Ardent Invoicing!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Your account is now set up and ready to use. Let's create your first invoice to get you started.
            </Typography>

            <Stack spacing={2} sx={{ maxWidth: 400, mx: 'auto' }}>
              <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ReceiptIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2">Create Your First Invoice</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Set up your first invoice with our guided process
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <MoneyIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2">Track Expenses</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start tracking your business expenses
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <BusinessIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2">Customize Settings</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Personalize your dashboard and preferences
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card
            sx={{
              width: isMobile ? '100vw' : 800,
              maxWidth: isMobile ? '100vw' : 800,
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              borderRadius: isMobile ? 0 : 3,
              mx: isMobile ? 0 : 2
            }}
          >
            <Box sx={{ p: 3, pb: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Welcome to Ardent Invoicing
                </Typography>
                <IconButton onClick={onClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>

              <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      icon={
                        <Avatar
                          sx={{
                            bgcolor: completedSteps.includes(index)
                              ? 'success.main'
                              : activeStep === index
                              ? `${step.color}.main`
                              : 'grey.300',
                            color: 'white'
                          }}
                        >
                          {completedSteps.includes(index) ? <CheckIcon /> : step.icon}
                        </Avatar>
                      }
                    >
                      <Typography variant="subtitle2">{step.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    </StepLabel>
                    {isMobile && (
                      <StepContent>
                        <Box sx={{ mt: 2 }}>
                          {renderStepContent(index)}
                          <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                            <Button
                              disabled={index === 0}
                              onClick={handleBack}
                              startIcon={<ArrowBackIcon />}
                            >
                              Back
                            </Button>
                            <Button
                              variant="contained"
                              onClick={index === steps.length - 1 ? handleComplete : handleNext}
                              endIcon={index === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
                              disabled={isLoading}
                            >
                              {isLoading ? <CircularProgress size={20} /> : 
                               index === steps.length - 1 ? 'Get Started' : 'Next'}
                            </Button>
                          </Box>
                        </Box>
                      </StepContent>
                    )}
                  </Step>
                ))}
              </Stepper>
            </Box>

            {!isMobile && (
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent(activeStep)}
                  </motion.div>
                </AnimatePresence>

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    size="large"
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 1 ? handleComplete : handleNext}
                    endIcon={activeStep === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
                    disabled={isLoading}
                    size="large"
                    sx={{ px: 4 }}
                  >
                    {isLoading ? <CircularProgress size={20} /> : 
                     activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  </Button>
                </Box>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
