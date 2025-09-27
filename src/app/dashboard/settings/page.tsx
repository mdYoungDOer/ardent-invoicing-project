'use client';

import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Save as SaveIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import SMELayout from '@/components/sme/SMELayout';

const businessSettingsSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_email: z.string().email('Invalid email').optional().or(z.literal('')),
  business_phone: z.string().optional(),
  business_address: z.string().optional(),
  business_registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  logo_url: z.string().optional(),
});

const invoiceSettingsSchema = z.object({
  default_currency: z.string().min(1, 'Currency is required'),
  default_tax_rate: z.number().min(0).max(100),
  default_payment_terms: z.number().min(1),
  invoice_prefix: z.string().optional(),
  footer_message: z.string().optional(),
  include_bank_details: z.boolean(),
  auto_send_invoices: z.boolean(),
});

const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  invoice_reminders: z.boolean(),
  payment_notifications: z.boolean(),
  low_stock_alerts: z.boolean(),
  weekly_reports: z.boolean(),
  monthly_reports: z.boolean(),
});

type BusinessSettingsData = z.infer<typeof businessSettingsSchema>;
type InvoiceSettingsData = z.infer<typeof invoiceSettingsSchema>;
type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;

const CURRENCIES = [
  { value: 'GHS', label: '🇬🇭 Ghana Cedis (GHS)' },
  { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
  { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
  { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
];

export default function SettingsPage() {
  const { tenant, user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const businessForm = useForm<BusinessSettingsData>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      business_name: '',
      business_email: '',
      business_phone: '',
      business_address: '',
      business_registration_number: '',
      tax_id: '',
      website: '',
      logo_url: '',
    },
  });

  const invoiceForm = useForm<InvoiceSettingsData>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      default_currency: 'GHS',
      default_tax_rate: 12.5,
      default_payment_terms: 30,
      invoice_prefix: 'INV',
      footer_message: '',
      include_bank_details: false,
      auto_send_invoices: false,
    },
  });

  const notificationForm = useForm<NotificationSettingsData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      email_notifications: true,
      invoice_reminders: true,
      payment_notifications: true,
      low_stock_alerts: false,
      weekly_reports: false,
      monthly_reports: true,
    },
  });

  useEffect(() => {
    if (tenant?.id) {
      loadSettings();
    }
  }, [tenant?.id]);

  const loadSettings = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      
      // Load business settings
      try {
        const { data: businessData } = await supabase
          .from('business_settings')
          .select('*')
          .eq('tenant_id', tenant.id)
          .single();

        if (businessData) {
          businessForm.reset({
            business_name: businessData.business_name || '',
            business_email: businessData.business_email || '',
            business_phone: businessData.business_phone || '',
            business_address: businessData.business_address || '',
            business_registration_number: businessData.business_registration_number || '',
            tax_id: businessData.tax_id || '',
            website: businessData.website || '',
            logo_url: businessData.logo_url || '',
          });
        } else {
          // Use tenant data as fallback
          businessForm.reset({
            business_name: tenant.business_name || '',
            business_email: '',
            business_phone: '',
            business_address: '',
            business_registration_number: '',
            tax_id: '',
            website: '',
            logo_url: '',
          });
        }
      } catch (error) {
        console.warn('Business settings table not found, using tenant data:', error);
        // Use tenant data as fallback
        businessForm.reset({
          business_name: tenant.business_name || '',
          business_email: '',
          business_phone: '',
          business_address: '',
          business_registration_number: '',
          tax_id: '',
          website: '',
          logo_url: '',
        });
      }

      // Load invoice settings
      try {
        const { data: invoiceData } = await supabase
          .from('invoice_settings')
          .select('*')
          .eq('tenant_id', tenant.id)
          .single();

        if (invoiceData) {
          invoiceForm.reset(invoiceData);
        }
      } catch (error) {
        console.warn('Invoice settings table not found, using defaults:', error);
      }

      // Load notification settings
      try {
        const { data: notificationData } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('tenant_id', tenant.id)
          .single();

        if (notificationData) {
          notificationForm.reset(notificationData);
        }
      } catch (error) {
        console.warn('Notification settings table not found, using defaults:', error);
      }

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessSettings = async (data: BusinessSettingsData) => {
    if (!tenant?.id) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('business_settings')
        .upsert({
          tenant_id: tenant.id,
          ...data,
          business_email: data.business_email || null,
          business_phone: data.business_phone || null,
          business_address: data.business_address || null,
          business_registration_number: data.business_registration_number || null,
          tax_id: data.tax_id || null,
          website: data.website || null,
          logo_url: data.logo_url || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setSaveMessage('Business settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving business settings:', error);
      setSaveMessage('Error saving business settings');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const saveInvoiceSettings = async (data: InvoiceSettingsData) => {
    if (!tenant?.id) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('invoice_settings')
        .upsert({
          tenant_id: tenant.id,
          ...data,
          invoice_prefix: data.invoice_prefix || null,
          footer_message: data.footer_message || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setSaveMessage('Invoice settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving invoice settings:', error);
      setSaveMessage('Error saving invoice settings');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async (data: NotificationSettingsData) => {
    if (!tenant?.id) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          tenant_id: tenant.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setSaveMessage('Notification settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaveMessage('Error saving notification settings');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SMELayout title="Settings">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </SMELayout>
    );
  }

  return (
    <SMELayout title="Settings">
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Settings
        </Typography>

        {saveMessage && (
          <Alert severity={saveMessage.includes('Error') ? 'error' : 'success'} sx={{ mb: 4 }}>
            {saveMessage}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Business Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Business Information
                  </Typography>
                </Box>

                <form onSubmit={businessForm.handleSubmit(saveBusinessSettings)}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="business_name"
                        control={businessForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Business Name *"
                            error={!!businessForm.formState.errors.business_name}
                            helperText={businessForm.formState.errors.business_name?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="business_email"
                        control={businessForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Business Email"
                            type="email"
                            error={!!businessForm.formState.errors.business_email}
                            helperText={businessForm.formState.errors.business_email?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="business_phone"
                        control={businessForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Business Phone"
                            error={!!businessForm.formState.errors.business_phone}
                            helperText={businessForm.formState.errors.business_phone?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="business_address"
                        control={businessForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Business Address"
                            multiline
                            rows={3}
                            error={!!businessForm.formState.errors.business_address}
                            helperText={businessForm.formState.errors.business_address?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="business_registration_number"
                        control={businessForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Registration Number"
                            error={!!businessForm.formState.errors.business_registration_number}
                            helperText={businessForm.formState.errors.business_registration_number?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="tax_id"
                        control={businessForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Tax ID"
                            error={!!businessForm.formState.errors.tax_id}
                            helperText={businessForm.formState.errors.tax_id?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="website"
                        control={businessForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Website"
                            error={!!businessForm.formState.errors.website}
                            helperText={businessForm.formState.errors.website?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={saving}
                        fullWidth
                      >
                        {saving ? 'Saving...' : 'Save Business Settings'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Invoice Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Invoice Settings
                  </Typography>
                </Box>

                <form onSubmit={invoiceForm.handleSubmit(saveInvoiceSettings)}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="default_currency"
                        control={invoiceForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            select
                            label="Default Currency *"
                            error={!!invoiceForm.formState.errors.default_currency}
                            helperText={invoiceForm.formState.errors.default_currency?.message}
                          >
                            {CURRENCIES.map((currency) => (
                              <MenuItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="default_tax_rate"
                        control={invoiceForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Default Tax Rate (%)"
                            type="number"
                            inputProps={{ min: 0, max: 100, step: 0.1 }}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            error={!!invoiceForm.formState.errors.default_tax_rate}
                            helperText={invoiceForm.formState.errors.default_tax_rate?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="default_payment_terms"
                        control={invoiceForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Default Payment Terms (Days)"
                            type="number"
                            inputProps={{ min: 1 }}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            error={!!invoiceForm.formState.errors.default_payment_terms}
                            helperText={invoiceForm.formState.errors.default_payment_terms?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="invoice_prefix"
                        control={invoiceForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Invoice Prefix"
                            error={!!invoiceForm.formState.errors.invoice_prefix}
                            helperText={invoiceForm.formState.errors.invoice_prefix?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="footer_message"
                        control={invoiceForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Footer Message"
                            multiline
                            rows={3}
                            error={!!invoiceForm.formState.errors.footer_message}
                            helperText={invoiceForm.formState.errors.footer_message?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="include_bank_details"
                        control={invoiceForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            }
                            label="Include Bank Details on Invoices"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="auto_send_invoices"
                        control={invoiceForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            }
                            label="Automatically Send Invoices"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={saving}
                        fullWidth
                      >
                        {saving ? 'Saving...' : 'Save Invoice Settings'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <NotificationsIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notification Preferences
                  </Typography>
                </Box>

                <form onSubmit={notificationForm.handleSubmit(saveNotificationSettings)}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Controller
                        name="email_notifications"
                        control={notificationForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            }
                            label="Email Notifications"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Controller
                        name="invoice_reminders"
                        control={notificationForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            }
                            label="Invoice Reminders"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Controller
                        name="payment_notifications"
                        control={notificationForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            }
                            label="Payment Notifications"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Controller
                        name="low_stock_alerts"
                        control={notificationForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            }
                            label="Low Stock Alerts"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Controller
                        name="weekly_reports"
                        control={notificationForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            }
                            label="Weekly Reports"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Controller
                        name="monthly_reports"
                        control={notificationForm.control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            }
                            label="Monthly Reports"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={saving}
                        fullWidth
                      >
                        {saving ? 'Saving...' : 'Save Notification Settings'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </SMELayout>
  );
}
