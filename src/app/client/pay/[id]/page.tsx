'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent,
  Button,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Divider,
  Paper,
  Chip,
  IconButton,
  Grid
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getCurrencyFlag } from '@/lib/exchange-rates';
import { motion } from 'framer-motion';
import type { Invoice } from '@/lib/store';

export default function ClientPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      
      // Get invoice details (public access for payment)
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          tenants!inner(business_name, business_address, business_phone, business_email)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      
      setInvoice(data);
    } catch (error) {
      setError('Invoice not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!invoice) return;
    
    setProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/pay/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          clientEmail: invoice.client_email || '',
          clientName: invoice.client_name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        setError(data.error || 'Payment initialization failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !invoice) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (paymentSuccess) {
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
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
              
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                Payment Successful!
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Thank you for your payment. A receipt has been sent to your email address.
              </Typography>
              
              <Button
                variant="contained"
                onClick={() => window.close()}
                sx={{ bgcolor: 'primary.main' }}
              >
                Close Window
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton component="div" onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Pay Invoice
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={4}>
            {/* Invoice Details */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                    Invoice #{invoice?.invoice_number}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      From:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {invoice?.tenants?.business_name}
                    </Typography>
                    {invoice?.tenants?.business_address && (
                      <Typography variant="body2" color="text.secondary">
                        {invoice.tenants.business_address}
                      </Typography>
                    )}
                    {invoice?.tenants?.business_phone && (
                      <Typography variant="body2" color="text.secondary">
                        Phone: {invoice.tenants.business_phone}
                      </Typography>
                    )}
                    {invoice?.tenants?.business_email && (
                      <Typography variant="body2" color="text.secondary">
                        Email: {invoice.tenants.business_email}
                      </Typography>
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Bill To:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {invoice?.client_name}
                    </Typography>
                    {invoice?.client_email && (
                      <Typography variant="body2" color="text.secondary">
                        {invoice.client_email}
                      </Typography>
                    )}
                    {invoice?.client_phone && (
                      <Typography variant="body2" color="text.secondary">
                        {invoice.client_phone}
                      </Typography>
                    )}
                    {invoice?.client_address && (
                      <Typography variant="body2" color="text.secondary">
                        {invoice.client_address}
                      </Typography>
                    )}
                  </Box>
                  
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Amount Due
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {getCurrencyFlag(invoice?.currency || 'GHS')} {formatCurrency(invoice?.amount || 0, invoice?.currency || 'GHS')}
                        </Typography>
                      </Box>
                      <Chip
                        label={invoice?.status?.toUpperCase()}
                        color={invoice?.status === 'paid' ? 'success' : invoice?.status === 'overdue' ? 'error' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Due: {invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Paper>
                  
                  {invoice?.notes && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Notes:
                      </Typography>
                      <Typography variant="body2" sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                        {invoice.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Payment Section */}
            <Grid item xs={12} md={4}>
              <Card sx={{ position: 'sticky', top: 20 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Complete Payment
                  </Typography>
                  
                  {invoice?.status === 'paid' ? (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      This invoice has already been paid.
                    </Alert>
                  ) : (
                    <>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Payment Amount
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {getCurrencyFlag(invoice?.currency || 'GHS')} {formatCurrency(invoice?.amount || 0, invoice?.currency || 'GHS')}
                        </Typography>
                        
                        {invoice?.currency !== 'GHS' && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              <strong>Payment in Ghana Cedis:</strong> You will be charged the equivalent amount in GHS for local processing.
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SecurityIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Secure payment powered by Paystack
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PaymentIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Accepts all major cards and mobile money
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ReceiptIcon sx={{ mr: 1, color: 'info.main', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Instant receipt via email
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handlePayment}
                        disabled={processing || invoice?.status === 'paid'}
                        sx={{ bgcolor: 'primary.main', py: 1.5 }}
                      >
                        {processing ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Pay with Paystack'
                        )}
                      </Button>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                        By clicking "Pay with Paystack", you agree to our terms of service.
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
