'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
  icon?: React.ReactNode;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: TourStep[];
  context?: 'dashboard' | 'invoice' | 'expense' | 'settings';
}

export default function GuidedTour({ 
  isOpen, 
  onClose, 
  onComplete, 
  steps,
  context = 'dashboard'
}: GuidedTourProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [overlayRect, setOverlayRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target) as HTMLElement;
    if (targetElement) {
      setHighlightedElement(targetElement);
      setOverlayRect(targetElement.getBoundingClientRect());
      
      // Scroll element into view
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });

      // Add highlight effect
      targetElement.style.transition = 'all 0.3s ease';
      targetElement.style.boxShadow = `0 0 0 4px ${theme.palette.primary.main}40`;
      targetElement.style.borderRadius = '8px';
      targetElement.style.zIndex = '1000';

      return () => {
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
        targetElement.style.zIndex = '';
      };
    }
  }, [currentStep, isOpen, currentStepData, theme.palette.primary.main]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const getTooltipPosition = () => {
    if (!overlayRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const spacing = 20;
    const tooltipWidth = isMobile ? 320 : 400;
    const tooltipHeight = 200;

    let top = overlayRect.top + overlayRect.height + spacing;
    let left = overlayRect.left;
    let transform = 'translateX(0)';

    // Adjust for viewport boundaries
    if (top + tooltipHeight > window.innerHeight) {
      top = overlayRect.top - tooltipHeight - spacing;
    }

    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - spacing;
      transform = 'translateX(0)';
    }

    if (left < spacing) {
      left = spacing;
    }

    return { top: `${top}px`, left: `${left}px`, transform };
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
          zIndex: 1400,
          pointerEvents: 'none'
        }}
      >
        {/* Dark overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            pointerEvents: 'auto'
          }}
          onClick={handleSkip}
        />

        {/* Highlighted area */}
        {overlayRect && (
          <Box
            sx={{
              position: 'absolute',
              top: overlayRect.top - 8,
              left: overlayRect.left - 8,
              width: overlayRect.width + 16,
              height: overlayRect.height + 16,
              border: `3px solid ${theme.palette.primary.main}`,
              borderRadius: 2,
              backgroundColor: 'transparent',
              pointerEvents: 'none',
              animation: 'pulse 2s infinite'
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: 'absolute',
              ...getTooltipPosition(),
              pointerEvents: 'auto',
              zIndex: 1500,
              maxWidth: isMobile ? '95vw' : 400,
              left: isMobile ? '2.5vw' : getTooltipPosition().left
            }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 3,
              borderRadius: 3,
              maxWidth: isMobile ? 320 : 400,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
              border: `1px solid ${theme.palette.divider}`,
              position: 'relative'
            }}
          >
            {/* Progress indicator */}
            <Box sx={{ mb: 2 }}>
              <Stepper activeStep={currentStep} alternativeLabel>
                {steps.map((step, index) => (
                  <Step key={step.id}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontSize: '0.75rem'
                        }
                      }}
                    >
                      {index + 1}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                {currentStepData.icon && (
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40
                    }}
                  >
                    {currentStepData.icon}
                  </Avatar>
                )}
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {currentStepData.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Step {currentStep + 1} of {steps.length}
                  </Typography>
                </Box>
              </Stack>
              <IconButton 
                onClick={handleSkip} 
                size="small"
                aria-label="Close guided tour"
              >
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* Content */}
            <Typography variant="body1" sx={{ mb: 3 }}>
              {currentStepData.description}
            </Typography>

            {/* Tips */}
            {currentStepData.tips && currentStepData.tips.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  💡 Tips:
                </Typography>
                <Stack spacing={1}>
                  {currentStepData.tips.map((tip, index) => (
                    <Typography key={index} variant="body2" color="text.secondary">
                      • {tip}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Actions */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                onClick={handleSkip}
                color="inherit"
                size="small"
              >
                Skip Tour
              </Button>

              <Stack direction="row" spacing={1}>
                {currentStep > 0 && (
                  <Button
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                    size="small"
                  >
                    Back
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  endIcon={currentStep === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
                  variant="contained"
                  size="small"
                  sx={{ minWidth: 100 }}
                >
                  {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </Stack>
            </Stack>

            {/* Action button if specified */}
            {currentStepData.action && (
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                  onClick={currentStepData.action.onClick}
                  variant="contained"
                  fullWidth
                  startIcon={<PlayIcon />}
                  size="small"
                >
                  {currentStepData.action.label}
                </Button>
              </Box>
            )}
          </Paper>
        </motion.div>

        <style jsx>{`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

// Predefined tour steps for different contexts
export const dashboardTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Dashboard',
    description: 'This is your main control center where you can manage all your business operations.',
    target: '[data-tour="dashboard-header"]',
    position: 'bottom',
    tips: [
      'Use the sidebar to navigate between different sections',
      'Check your subscription status in the top right',
      'Access notifications and settings from the header'
    ]
  },
  {
    id: 'quick-stats',
    title: 'Quick Overview',
    description: 'These cards show your key business metrics at a glance.',
    target: '[data-tour="quick-stats"]',
    position: 'bottom',
    tips: [
      'Revenue shows your total income for the selected period',
      'Invoices displays your invoice count and status',
      'Expenses tracks your business spending'
    ]
  },
  {
    id: 'create-invoice',
    title: 'Create Your First Invoice',
    description: 'Click here to create and send professional invoices to your clients.',
    target: '[data-tour="create-invoice"]',
    position: 'right',
    action: {
      label: 'Create Invoice',
      onClick: () => window.location.href = '/dashboard/invoices/new'
    }
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    description: 'Stay updated with your latest invoices, payments, and expenses.',
    target: '[data-tour="recent-activity"]',
    position: 'top'
  }
];

export const invoiceTourSteps: TourStep[] = [
  {
    id: 'invoice-form',
    title: 'Invoice Creation Form',
    description: 'Fill in the details to create a professional invoice for your client.',
    target: '[data-tour="invoice-form"]',
    position: 'top',
    tips: [
      'Add client information or select from existing clients',
      'Include item details with descriptions and quantities',
      'Set payment terms and due dates'
    ]
  },
  {
    id: 'preview',
    title: 'Preview Your Invoice',
    description: 'Review how your invoice will look before sending it to your client.',
    target: '[data-tour="invoice-preview"]',
    position: 'left'
  },
  {
    id: 'save-send',
    title: 'Save & Send',
    description: 'Save as draft or send directly to your client via email.',
    target: '[data-tour="save-send"]',
    position: 'top'
  }
];
