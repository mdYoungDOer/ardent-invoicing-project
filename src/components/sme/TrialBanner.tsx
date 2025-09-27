'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Button,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Upgrade as UpgradeIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

interface TrialBannerProps {
  onUpgrade?: () => void;
}

export default function TrialBanner({ onUpgrade }: TrialBannerProps) {
  const router = useRouter();
  const { user, tenant } = useAppStore();
  const [showBanner, setShowBanner] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [trialPercentage, setTrialPercentage] = useState<number>(0);

  useEffect(() => {
    if (user?.subscription_status === 'trial' && user?.trial_ends_at) {
      const trialEndDate = new Date(user.trial_ends_at);
      const now = new Date();
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = 14; // 14-day trial
      const daysUsed = totalDays - daysLeft;
      const percentage = (daysUsed / totalDays) * 100;

      setTrialDaysLeft(Math.max(0, daysLeft));
      setTrialPercentage(Math.min(100, Math.max(0, percentage)));
    }
  }, [user]);

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/dashboard/subscribe');
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    // Store dismissal in localStorage for this session
    localStorage.setItem('trial_banner_dismissed', 'true');
  };

  // Don't show if not on trial or if dismissed
  if (!user || user.subscription_status !== 'trial' || !showBanner) {
    return null;
  }

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = localStorage.getItem('trial_banner_dismissed');
    if (dismissed === 'true') {
      setShowBanner(false);
    }
  }, []);

  const getPreferredPlan = () => {
    if (user.preferred_plan) {
      return SUBSCRIPTION_PLANS.find(plan => plan.id === user.preferred_plan);
    }
    return null;
  };

  const preferredPlan = getPreferredPlan();

  return (
    <Collapse in={showBanner}>
      <Card 
        elevation={3}
        sx={{ 
          mb: 3,
          border: '2px solid',
          borderColor: trialDaysLeft <= 3 ? 'warning.main' : 'primary.main',
          bgcolor: 'background.paper'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ScheduleIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Free Trial Active
              </Typography>
              <Chip 
                label={`${trialDaysLeft} days left`}
                color={trialDaysLeft <= 3 ? 'warning' : 'primary'}
                size="small"
              />
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Trial Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(trialPercentage)}% used
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={trialPercentage}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: trialDaysLeft <= 3 ? 'warning.main' : 'primary.main'
                }
              }}
            />
          </Box>

          {preferredPlan && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                You selected the <strong>{preferredPlan.name}</strong> plan. 
                Upgrade now to continue with full features after your trial ends.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="body2" color="text.secondary">
                {trialDaysLeft > 0 
                  ? `Your free trial includes 2 invoices per month. Upgrade anytime to unlock more features.`
                  : `Your trial has ended. Upgrade now to continue using Ardent Invoicing.`
                }
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                startIcon={<UpgradeIcon />}
                onClick={handleUpgrade}
                fullWidth
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: 4
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {preferredPlan ? `Upgrade to ${preferredPlan.name}` : 'Upgrade Plan'}
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" color="text.secondary">
              No credit card required during trial. Cancel anytime.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Collapse>
  );
}
