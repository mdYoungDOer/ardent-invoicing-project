'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Send as SendIcon,
  GetApp as DownloadIcon,
  MoreVert as MoreIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { fetchInvoiceById, fetchInvoiceLineItems, updateInvoice } from '@/lib/supabase-queries';
import { formatCurrency, getCurrencyFlag } from '@/lib/exchange-rates';
import InvoicePDF from '@/lib/pdf-generator';
import { pdf } from '@react-pdf/renderer';
import type { Invoice, InvoiceLineItem } from '@/lib/store';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { user, tenant, setLoading, setError, updateInvoice: updateInvoiceStore } = useAppStore();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [loading, setLoadingState] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceData();
    }
  }, [invoiceId]);

  const loadInvoiceData = async () => {
    try {
      setLoadingState(true);
      const [invoiceData, lineItemsData] = await Promise.all([
        fetchInvoiceById(invoiceId),
        fetchInvoiceLineItems(invoiceId)
      ]);
      
      if (invoiceData) {
        setInvoice(invoiceData);
        setLineItems(lineItemsData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load invoice');
    } finally {
      setLoadingState(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'primary';
      case 'draft': return 'default';
      case 'overdue': return 'error';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon />;
      case 'sent': return <SendIcon />;
      case 'draft': return <EditIcon />;
      case 'overdue': return <WarningIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const handleMarkAsSent = async () => {
    if (!invoice) return;
    
    try {
      setIsProcessing(true);
      const updatedInvoice = await updateInvoice(invoice.id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
      
      setInvoice(updatedInvoice);
      updateInvoiceStore(updatedInvoice.id, { status: 'sent', sent_at: updatedInvoice.sent_at });
      setSendDialogOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    
    try {
      setIsProcessing(true);
      const updatedInvoice = await updateInvoice(invoice.id, {
        status: 'paid',
        paid_at: new Date().toISOString(),
      });
      
      setInvoice(updatedInvoice);
      updateInvoiceStore(updatedInvoice.id, { status: 'paid', paid_at: updatedInvoice.paid_at });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mark as paid');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!invoice || !tenant) return;
    
    try {
      setIsProcessing(true);
      
      const companyInfo = {
        name: tenant.business_name,
        address: 'Ghana', // You can add more company details
        phone: '+233 XX XXX XXXX',
        email: user?.email || '',
        website: 'https://ardentinvoicing.com',
      };

      const pdfBlob = await pdf(InvoicePDF({ 
        invoice, 
        lineItems, 
        companyInfo 
      })).toBlob();
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total_amount, 0);
    const taxAmount = (subtotal * (invoice?.tax_rate || 0)) / 100;
    const discountAmount = invoice?.discount_amount || 0;
    const total = subtotal + taxAmount - discountAmount;
    
    return { subtotal, taxAmount, discountAmount, total };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Invoice not found</Alert>
      </Container>
    );
  }

  const totals = calculateTotals();
  const showCurrencyNote = invoice.currency !== 'GHS' && invoice.exchange_rate;

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton component="div" onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Invoice #{invoice.invoice_number}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={getStatusIcon(invoice.status)}
              label={invoice.status.toUpperCase()}
              color={getStatusColor(invoice.status)}
              variant="outlined"
            />
            <IconButton onClick={handleMenuClick}>
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Invoice Details */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {invoice.client_name}
                    </Typography>
                    {invoice.client_email && (
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {invoice.client_email}
                      </Typography>
                    )}
                    {invoice.client_phone && (
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {invoice.client_phone}
                      </Typography>
                    )}
                    {invoice.client_address && (
                      <Typography variant="body1" color="text.secondary">
                        {invoice.client_address}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {getCurrencyFlag(invoice.currency)} {formatCurrency(totals.total, invoice.currency)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Line Items */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Line Items
                </Typography>
                
                <Paper sx={{ overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', bgcolor: 'grey.50', p: 2, fontWeight: 600 }}>
                    <Box sx={{ flex: 3 }}>Description</Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>Qty</Box>
                    <Box sx={{ flex: 1.5, textAlign: 'right' }}>Unit Price</Box>
                    <Box sx={{ flex: 1.5, textAlign: 'right' }}>Total</Box>
                  </Box>
                  {lineItems.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', p: 2, borderBottom: index < lineItems.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                      <Box sx={{ flex: 3 }}>{item.description}</Box>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>{item.quantity}</Box>
                      <Box sx={{ flex: 1.5, textAlign: 'right' }}>
                        {getCurrencyFlag(invoice.currency)} {item.unit_price.toFixed(2)}
                      </Box>
                      <Box sx={{ flex: 1.5, textAlign: 'right', fontWeight: 600 }}>
                        {getCurrencyFlag(invoice.currency)} {item.total_amount.toFixed(2)}
                      </Box>
                    </Box>
                  ))}
                </Paper>

                {/* Totals */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Box sx={{ minWidth: 300 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>{getCurrencyFlag(invoice.currency)} {totals.subtotal.toFixed(2)}</Typography>
                    </Box>
                    
                    {invoice.tax_rate > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Tax ({invoice.tax_rate}%):</Typography>
                        <Typography>{getCurrencyFlag(invoice.currency)} {totals.taxAmount.toFixed(2)}</Typography>
                      </Box>
                    )}
                    
                    {invoice.discount_amount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Discount:</Typography>
                        <Typography>-{getCurrencyFlag(invoice.currency)} {totals.discountAmount.toFixed(2)}</Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {getCurrencyFlag(invoice.currency)} {totals.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Currency Conversion Note */}
                {showCurrencyNote && (
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Payment in Ghana Cedis:</strong> Please pay the equivalent amount in GHS via Paystack.
                      <br />
                      Exchange rate: 1 GHS = {invoice.exchange_rate?.toFixed(4)} {invoice.currency}
                      <br />
                      Amount due in GHS: {getCurrencyFlag('GHS')} {(totals.total / (invoice.exchange_rate || 1)).toFixed(2)}
                    </Typography>
                  </Alert>
                )}

                {/* Notes */}
                {invoice.notes && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                      {invoice.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Actions Sidebar */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Actions
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}
                    fullWidth
                  >
                    Edit Invoice
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleGeneratePDF}
                    disabled={isProcessing}
                    fullWidth
                  >
                    {isProcessing ? <CircularProgress size={20} /> : 'Download PDF'}
                  </Button>
                  
                  {invoice.status === 'draft' && (
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() => setSendDialogOpen(true)}
                      sx={{ bgcolor: 'primary.main' }}
                      fullWidth
                    >
                      Send Invoice
                    </Button>
                  )}
                  
                  {invoice.status === 'sent' && (
                    <Button
                      variant="contained"
                      startIcon={<PaymentIcon />}
                      onClick={handleMarkAsPaid}
                      disabled={isProcessing}
                      sx={{ bgcolor: 'success.main' }}
                      fullWidth
                    >
                      {isProcessing ? <CircularProgress size={20} /> : 'Mark as Paid'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => window.print()}
                    fullWidth
                  >
                    Print
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Invoice Details
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Invoice #:</Typography>
                    <Typography variant="body2">{invoice.invoice_number}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Created:</Typography>
                    <Typography variant="body2">{new Date(invoice.created_at).toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                    <Typography variant="body2">{new Date(invoice.due_date).toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Currency:</Typography>
                    <Typography variant="body2">{invoice.currency}</Typography>
                  </Box>
                  {invoice.sent_at && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Sent:</Typography>
                      <Typography variant="body2">{new Date(invoice.sent_at).toLocaleDateString()}</Typography>
                    </Box>
                  )}
                  {invoice.paid_at && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Paid:</Typography>
                      <Typography variant="body2">{new Date(invoice.paid_at).toLocaleDateString()}</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <PrintIcon sx={{ mr: 1 }} />
          Print
        </MenuItem>
      </Menu>

      {/* Send Invoice Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)}>
        <DialogTitle>Send Invoice</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send this invoice to {invoice.client_name}?
            This will mark the invoice as sent and notify the client.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleMarkAsSent} 
            variant="contained" 
            disabled={isProcessing}
            sx={{ bgcolor: 'primary.main' }}
          >
            {isProcessing ? <CircularProgress size={20} /> : 'Send Invoice'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
