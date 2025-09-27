'use client';

import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/lib/store';
import { createInvoice, createInvoiceLineItems, checkInvoiceQuota } from '@/lib/supabase-queries';
import { getExchangeRate } from '@/lib/exchange-rates';
import { createInvoiceSchema, type CreateInvoiceData } from '@/lib/validations';
import { getCurrencyFlag } from '@/lib/exchange-rates';
import { supabase } from '@/lib/supabase';
import SMELayout from '@/components/sme/SMELayout';

const CURRENCIES = [
  { value: 'GHS', label: '🇬🇭 Ghana Cedis (GHS)', default: true },
  { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
  { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
  { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
  { value: 'CAD', label: '🇨🇦 Canadian Dollar (CAD)' },
  { value: 'AUD', label: '🇦🇺 Australian Dollar (AUD)' },
];

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { user, tenant, setLoading, setError, addInvoice } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('GHS');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateInvoiceData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      currency: 'GHS',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      tax_rate: 12.5,
      discount_amount: 0,
      notes: '',
      line_items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          total_amount: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  });

  const watchedLineItems = watch('line_items');
  const watchedCurrency = watch('currency');

  // Calculate totals
  const subtotal = watchedLineItems?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0;
  const taxAmount = (subtotal * (watch('tax_rate') || 0)) / 100;
  const discountAmount = watch('discount_amount') || 0;
  const total = subtotal + taxAmount - discountAmount;

  // Load customers when component mounts
  useEffect(() => {
    if (tenant?.id) {
      loadCustomers();
    }
  }, [tenant?.id]);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (watchedCurrency !== 'GHS') {
      fetchExchangeRate();
    } else {
      setExchangeRate(null);
    }
  }, [watchedCurrency]);

  const loadCustomers = async () => {
    if (!tenant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const rate = await getExchangeRate('GHS', watchedCurrency);
      setExchangeRate(rate.rate);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      setExchangeRate(null);
    }
  };

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      // Auto-fill form fields with customer data
      setValue('client_name', customer.name);
      setValue('client_email', customer.email || '');
      setValue('client_phone', customer.phone || '');
      setValue('client_address', customer.address || '');
    }
  };

  const addLineItem = () => {
    append({
      description: '',
      quantity: 1,
      unit_price: 0,
      total_amount: 0,
    });
  };

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const onSubmit = async (data: CreateInvoiceData) => {
    if (!user || !tenant) return;

    try {
      setIsSubmitting(true);

      // Check quota
      const hasQuota = await checkInvoiceQuota(user.id);
      if (!hasQuota) {
        setError('Invoice quota exceeded. Please upgrade your plan.');
        return;
      }

      // Create invoice
      const invoiceData = {
        tenant_id: tenant.id,
        invoice_number: generateInvoiceNumber(),
        client_name: data.client_name,
        client_email: data.client_email || null,
        client_phone: data.client_phone || null,
        client_address: data.client_address || null,
        amount: total,
        currency: data.currency,
        tax_rate: data.tax_rate,
        discount_amount: data.discount_amount,
        exchange_rate: exchangeRate,
        status: 'draft' as const,
        due_date: data.due_date,
        notes: data.notes || null,
        recurring_config: data.recurring_config || null,
      };

      const invoice = await createInvoice(invoiceData);

      // Create line items
      const lineItemsData = data.line_items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total_amount,
      }));

      await createInvoiceLineItems(lineItemsData);

      addInvoice(invoice);
      router.push(`/dashboard/invoices/${invoice.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SMELayout title="Create New Invoice">
      <Box sx={{ p: 4 }}>
        {/* Header Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Create New Invoice
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={20} /> : 'Save Draft'}
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit((data) => onSubmit({ ...data, status: 'sent' as any }))}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={20} /> : 'Send Invoice'}
            </Button>
          </Box>
        </Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            {/* Client Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Client Information
                  </Typography>
                  
                  {/* Customer Selection */}
                  {customers.length > 0 && (
                    <TextField
                      fullWidth
                      select
                      label="Select Existing Customer (Optional)"
                      value={selectedCustomer?.id || ''}
                      onChange={(e) => {
                        const customer = customers.find(c => c.id === e.target.value);
                        handleCustomerSelect(customer || null);
                      }}
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value="">
                        <em>Create new customer</em>
                      </MenuItem>
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.name} {customer.company && `(${customer.company})`}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                  
                  <Controller
                    name="client_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Client Name *"
                        error={!!errors.client_name}
                        helperText={errors.client_name?.message}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  <Controller
                    name="client_email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        type="email"
                        error={!!errors.client_email}
                        helperText={errors.client_email?.message}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  <Controller
                    name="client_phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone Number"
                        error={!!errors.client_phone}
                        helperText={errors.client_phone?.message}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  <Controller
                    name="client_address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Address"
                        multiline
                        rows={3}
                        error={!!errors.client_address}
                        helperText={errors.client_address?.message}
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Invoice Details */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Invoice Details
                  </Typography>

                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Currency *"
                        error={!!errors.currency}
                        helperText={errors.currency?.message}
                        sx={{ mb: 2 }}
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedCurrency(e.target.value);
                        }}
                      >
                        {CURRENCIES.map((currency) => (
                          <MenuItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  {watchedCurrency !== 'GHS' && exchangeRate && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Exchange Rate: 1 GHS = {exchangeRate.toFixed(4)} {watchedCurrency}
                    </Alert>
                  )}

                  <Controller
                    name="due_date"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Due Date *"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.due_date}
                        helperText={errors.due_date?.message}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Controller
                        name="tax_rate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Tax Rate (%)"
                            type="number"
                            error={!!errors.tax_rate}
                            helperText={errors.tax_rate?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="discount_amount"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Discount Amount"
                            type="number"
                            error={!!errors.discount_amount}
                            helperText={errors.discount_amount?.message}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Line Items */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Line Items
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addLineItem}
                    >
                      Add Item
                    </Button>
                  </Box>

                  {fields.map((field, index) => (
                    <Paper key={field.id} sx={{ p: 2, mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                          <Controller
                            name={`line_items.${index}.description`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Description"
                                error={!!errors.line_items?.[index]?.description}
                                helperText={errors.line_items?.[index]?.description?.message}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <Controller
                            name={`line_items.${index}.quantity`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Quantity"
                                type="number"
                                onChange={(e) => {
                                  const quantity = parseFloat(e.target.value) || 0;
                                  const unitPrice = watchedLineItems?.[index]?.unit_price || 0;
                                  const total = calculateLineTotal(quantity, unitPrice);
                                  setValue(`line_items.${index}.quantity`, quantity);
                                  setValue(`line_items.${index}.total_amount`, total);
                                }}
                                error={!!errors.line_items?.[index]?.quantity}
                                helperText={errors.line_items?.[index]?.quantity?.message}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <Controller
                            name={`line_items.${index}.unit_price`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Unit Price"
                                type="number"
                                onChange={(e) => {
                                  const unitPrice = parseFloat(e.target.value) || 0;
                                  const quantity = watchedLineItems?.[index]?.quantity || 0;
                                  const total = calculateLineTotal(quantity, unitPrice);
                                  setValue(`line_items.${index}.unit_price`, unitPrice);
                                  setValue(`line_items.${index}.total_amount`, total);
                                }}
                                error={!!errors.line_items?.[index]?.unit_price}
                                helperText={errors.line_items?.[index]?.unit_price?.message}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={10} md={2}>
                          <Controller
                            name={`line_items.${index}.total_amount`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Total"
                                type="number"
                                InputProps={{
                                  startAdornment: getCurrencyFlag(watchedCurrency || 'GHS') + ' ',
                                }}
                                disabled
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={2} md={1}>
                          <IconButton
                            onClick={() => removeLineItem(index)}
                            disabled={fields.length === 1}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Invoice Summary */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Invoice Summary
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{getCurrencyFlag(watchedCurrency)} {subtotal.toFixed(2)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax ({(watch('tax_rate') || 0).toFixed(1)}%):</Typography>
                    <Typography>{getCurrencyFlag(watchedCurrency)} {taxAmount.toFixed(2)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Discount:</Typography>
                    <Typography>-{getCurrencyFlag(watchedCurrency)} {discountAmount.toFixed(2)}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {getCurrencyFlag(watchedCurrency)} {total.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Additional Notes
                  </Typography>
                  
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Notes"
                        multiline
                        rows={4}
                        error={!!errors.notes}
                        helperText={errors.notes?.message}
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>
    </SMELayout>
  );
}
