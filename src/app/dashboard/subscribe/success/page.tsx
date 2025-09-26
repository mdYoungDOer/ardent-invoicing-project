'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Divider
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    if (reference) {
      verifyPayment(reference);
    } else {
      setError('No payment reference found');
      setLoading(false);
    }
  }, [reference]);

  const verifyPayment = async (paymentReference: string) => {
    try {
      setLoading(true);
      
      // Verify payment with Paystack
      const response = await fetch('/api/webhook/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'charge.success',
          data: {
            reference: paymentReference,
            status: 'success',
          }
        }),
      });

      if (response.ok) {
        // Get updated subscription data
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('paystack_reference', paymentReference)
            .single();
          
          setSubscriptionData(subscription);
        }
        
        setSuccess(true);
      } else {
        setError('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError('Unable to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Verifying your payment...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
              Payment Verification
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => router.push('/dashboard/subscribe')}
              sx={{ bgcolor: 'primary.main' }}
            >
              Try Again
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Payment Successful
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              🎉 Welcome to Ardent Invoicing!
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Your subscription has been activated successfully
            </Typography>
          </Box>

          {subscriptionData && (
            <Card sx={{ mb: 6 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Subscription Details
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Plan
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {subscriptionData.plan_id}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Billing
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {subscriptionData.interval}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      ₵{subscriptionData.amount}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                      Active
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="body2" color="text.secondary">
                  Your subscription is now active and you have access to all premium features. 
                  A confirmation email has been sent to your registered email address.
                </Typography>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push('/dashboard')}
              sx={{ bgcolor: 'primary.main', px: 4, py: 1.5 }}
            >
              Go to Dashboard
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 6, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="body2">
              <strong>Next Steps:</strong> Explore your dashboard to create your first invoice, 
              set up expense tracking, and customize your business settings. 
              If you need help, check out our documentation or contact support.
            </Typography>
          </Alert>
        </motion.div>
      </Container>
    </Box>
  );
}
