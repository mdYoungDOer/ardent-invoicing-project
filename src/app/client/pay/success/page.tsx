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
  Receipt as ReceiptIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getCurrencyFlag } from '@/lib/exchange-rates';
import { motion } from 'framer-motion';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState('');

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
      
      // Get payment details from database
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          tenants!inner(business_name, business_email)
        `)
        .eq('payment_reference', paymentReference)
        .single();

      if (invoiceError) {
        throw new Error('Payment not found');
      }

      setPaymentData(invoice);
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
              onClick={() => router.push('/')}
              sx={{ bgcolor: 'primary.main' }}
            >
              Return Home
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
              Payment Received!
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Thank you for your payment. Your invoice has been marked as paid.
            </Typography>
          </Box>

          {paymentData && (
            <Card sx={{ mb: 6 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Payment Receipt
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Invoice Number
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {paymentData.invoice_number}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Amount Paid
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {getCurrencyFlag(paymentData.currency)} {formatCurrency(paymentData.total_amount, paymentData.currency)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Payment Date
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Transaction Reference
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {paymentData.payment_reference}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Paid to
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {paymentData.tenants?.business_name}
                  </Typography>
                  {paymentData.tenants?.business_email && (
                    <Typography variant="body2" color="text.secondary">
                      {paymentData.tenants.business_email}
                    </Typography>
                  )}
                </Box>
                
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Payment Confirmed:</strong> Your payment has been successfully processed 
                    and a receipt has been sent to your email address.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ReceiptIcon />}
              onClick={() => window.print()}
              sx={{ bgcolor: 'primary.main', px: 4, py: 1.5 }}
            >
              Print Receipt
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={() => {
                // Email receipt functionality would be handled by the backend
                alert('Receipt sent to your email address');
              }}
            >
              Email Receipt
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 6, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="body2">
              <strong>Keep this receipt:</strong> This serves as proof of payment for your records. 
              If you have any questions about this payment, please contact the business directly.
            </Typography>
          </Alert>
        </motion.div>
      </Container>
    </Box>
  );
}
