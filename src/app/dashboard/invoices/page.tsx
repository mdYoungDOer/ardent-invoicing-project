'use client';

import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Fab
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { fetchInvoices, searchInvoices } from '@/lib/supabase-queries';
import { formatCurrency, getCurrencySymbol, getCurrencyFlag } from '@/lib/exchange-rates';
import type { Invoice } from '@/lib/store';
import SMELayout from '@/components/sme/SMELayout';

export default function InvoicesPage() {
  const router = useRouter();
  const { user, tenant, invoices, setInvoices, setLoading, setError } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (tenant?.id) {
      loadInvoices();
    }
  }, [tenant?.id]);

  const loadInvoices = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      const data = await fetchInvoices(tenant.id);
      setInvoices(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      const data = await searchInvoices(tenant.id, searchTerm, {
        status: statusFilter || undefined,
      });
      setInvoices(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to search invoices');
    } finally {
      setLoading(false);
    }
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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleViewInvoice = () => {
    if (selectedInvoice) {
      router.push(`/dashboard/invoices/${selectedInvoice.id}`);
    }
    handleMenuClose();
  };

  const handleEditInvoice = () => {
    if (selectedInvoice) {
      router.push(`/dashboard/invoices/${selectedInvoice.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDownloadPDF = () => {
    if (selectedInvoice?.pdf_url) {
      window.open(selectedInvoice.pdf_url, '_blank');
    }
    handleMenuClose();
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <SMELayout title="Invoices">
      <Box sx={{ p: 4 }}>
        {/* Search and Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={handleSearch}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Invoices Grid */}
        <Grid container spacing={3}>
          {filteredInvoices.map((invoice) => (
            <Grid item xs={12} sm={6} md={4} key={invoice.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(166, 124, 0, 0.25)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      {invoice.invoice_number}
                    </Typography>
                    <Chip
                      label={invoice.status.toUpperCase()}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    {invoice.client_name}
                  </Typography>
                  
                  {invoice.client_email && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {invoice.client_email}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {getCurrencyFlag(invoice.currency)} {formatCurrency(invoice.amount, invoice.currency)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, invoice)}
                  >
                    <MoreIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredInvoices.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No invoices found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first invoice to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/invoices/new')}
              sx={{ bgcolor: 'primary.main' }}
            >
              Create Invoice
            </Button>
          </Box>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewInvoice}>
            <ViewIcon sx={{ mr: 1 }} />
            View
          </MenuItem>
          <MenuItem onClick={handleEditInvoice}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          {selectedInvoice?.pdf_url && (
            <MenuItem onClick={handleDownloadPDF}>
              <DownloadIcon sx={{ mr: 1 }} />
              Download PDF
            </MenuItem>
          )}
        </Menu>
      </Box>
    </SMELayout>
  );
}
