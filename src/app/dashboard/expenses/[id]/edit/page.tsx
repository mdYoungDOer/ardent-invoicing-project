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
  CircularProgress,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  AttachFile as AttachFileIcon,
  MyLocation as LocationIcon,
  QrCodeScanner as ScanIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/lib/store';
import { fetchExpenseById, updateExpense, uploadReceipt } from '@/lib/supabase-queries';
import { createExpenseSchema, type CreateExpenseData } from '@/lib/validations';
import { getCurrencyFlag } from '@/lib/exchange-rates';
import SMELayout from '@/components/sme/SMELayout';

const CURRENCIES = [
  { value: 'GHS', label: '🇬🇭 Ghana Cedis (GHS)', default: true },
  { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
  { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
  { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
  { value: 'CAD', label: '🇨🇦 Canadian Dollar (CAD)' },
  { value: 'AUD', label: '🇦🇺 Australian Dollar (AUD)' },
];

const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Travel',
  'Meals',
  'Transportation',
  'Marketing',
  'Software',
  'Utilities',
  'Professional Services',
  'Equipment',
  'Other'
];

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;
  
  const { user, tenant, setLoading, setError, updateExpenseInStore } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateExpenseData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      currency: 'GHS',
      category: '',
      expense_date: new Date().toISOString().split('T')[0],
      location: '',
      mileage_distance: undefined,
      tags: [],
      is_business: true,
    },
  });

  const watchedLineItems = watch();

  useEffect(() => {
    if (expenseId && tenant?.id) {
      loadExpense();
    }
  }, [expenseId, tenant?.id]);

  const loadExpense = async () => {
    if (!expenseId || !tenant?.id) return;
    
    try {
      setIsLoading(true);
      const expense = await fetchExpenseById(expenseId, tenant.id);
      
      if (!expense) {
        setError('Expense not found');
        router.push('/dashboard/expenses');
        return;
      }

      // Populate form with existing data
      reset({
        description: expense.description || '',
        amount: expense.amount || 0,
        currency: expense.currency || 'GHS',
        category: expense.category || '',
        expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
        location: expense.location || '',
        mileage_distance: expense.mileage_distance || undefined,
        tags: expense.tags || [],
        is_business: expense.is_business ?? true,
      });

      if (expense.receipt_url) {
        setExistingReceiptUrl(expense.receipt_url);
      }

      if (expense.ocr_text) {
        setOcrText(expense.ocr_text);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load expense');
      router.push('/dashboard/expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExistingReceiptUrl(''); // Clear existing receipt URL when new file is selected
      // Auto-scan the receipt
      scanReceipt(file);
    }
  };

  const handleCameraCapture = () => {
    // This would integrate with device camera
    // For now, we'll trigger file input
    fileInputRef.current?.click();
  };

  const scanReceipt = async (file: File) => {
    try {
      setIsScanning(true);
      
      // Simulate OCR scanning (replace with actual OCR service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock OCR result - in real implementation, this would come from OCR service
      const mockOcrResult = `Receipt scanned:
Merchant: Sample Store
Amount: ${Math.floor(Math.random() * 100) + 10}.00
Date: ${new Date().toLocaleDateString()}
Items: Various items`;

      setOcrText(mockOcrResult);
      
      // Auto-populate amount if found in OCR
      const amountMatch = mockOcrResult.match(/Amount:\s*(\d+\.?\d*)/);
      if (amountMatch) {
        setValue('amount', parseFloat(amountMatch[1]));
      }
    } catch (error) {
      console.error('OCR scanning failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setValue('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
        }
      );
    } else {
      console.error('Geolocation is not supported');
      setIsGettingLocation(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setOcrText('');
    setExistingReceiptUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: CreateExpenseData) => {
    if (!user || !tenant || !expenseId) return;

    try {
      setIsSubmitting(true);

      let receiptUrl = existingReceiptUrl;
      
      // Upload new receipt if selected
      if (selectedFile) {
        const fileName = `${tenant.id}/${Date.now()}-${selectedFile.name}`;
        receiptUrl = await uploadReceipt(selectedFile, fileName);
      }

      // Update expense
      const expenseData = {
        id: expenseId,
        tenant_id: tenant.id,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        expense_date: data.expense_date,
        location: data.location || null,
        mileage_distance: data.mileage_distance || null,
        tags: data.tags || [],
        is_business: data.is_business,
        receipt_url: receiptUrl || null,
        ocr_text: ocrText || null,
      };

      const updatedExpense = await updateExpense(expenseData);
      updateExpenseInStore(updatedExpense);
      
      router.push('/dashboard/expenses');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SMELayout title="Edit Expense">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </SMELayout>
    );
  }

  return (
    <SMELayout title="Edit Expense">
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Edit Expense
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            {/* Main Form */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Expense Details
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Description */}
                    <Grid item xs={12}>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            placeholder="Enter expense description..."
                          />
                        )}
                      />
                    </Grid>

                    {/* Amount and Currency */}
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Amount"
                            type="number"
                            fullWidth
                            error={!!errors.amount}
                            helperText={errors.amount?.message}
                            InputProps={{
                              startAdornment: getCurrencyFlag(watchedLineItems?.currency || 'GHS') + ' ',
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="currency"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Currency"
                            fullWidth
                            error={!!errors.currency}
                            helperText={errors.currency?.message}
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

                    {/* Category and Date */}
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Category"
                            fullWidth
                            error={!!errors.category}
                            helperText={errors.category?.message}
                          >
                            {EXPENSE_CATEGORIES.map((category) => (
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="expense_date"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Expense Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.expense_date}
                            helperText={errors.expense_date?.message}
                          />
                        )}
                      />
                    </Grid>

                    {/* Location */}
                    <Grid item xs={12}>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Location (Optional)"
                            fullWidth
                            placeholder="Enter location or use GPS"
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={getCurrentLocation}
                                  disabled={isGettingLocation}
                                  edge="end"
                                >
                                  <LocationIcon />
                                </IconButton>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Mileage */}
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="mileage_distance"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Mileage Distance (km)"
                            type="number"
                            fullWidth
                            placeholder="Enter distance if applicable"
                          />
                        )}
                      />
                    </Grid>

                    {/* Business Expense */}
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="is_business"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Expense Type"
                            fullWidth
                          >
                            <MenuItem value={true}>Business Expense</MenuItem>
                            <MenuItem value={false}>Personal Expense</MenuItem>
                          </TextField>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Receipt Upload */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Receipt Upload
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* File Upload Area */}
                    <Grid item xs={12}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          border: '2px dashed',
                          borderColor: 'grey.300',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'primary.50',
                          },
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                        
                        <CameraIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Upload Receipt
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click to browse or drag and drop receipt image
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Selected File Display */}
                    {(selectedFile || existingReceiptUrl) && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <AttachFileIcon color="primary" />
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {selectedFile ? selectedFile.name : 'Existing Receipt'}
                                </Typography>
                                {selectedFile && (
                                  <Typography variant="body2" color="text.secondary">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {existingReceiptUrl && !selectedFile && (
                                <Button
                                  size="small"
                                  onClick={() => window.open(existingReceiptUrl, '_blank')}
                                >
                                  View
                                </Button>
                              )}
                              <IconButton size="small" color="error" onClick={removeFile}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {/* OCR Scanning Progress */}
                    {isScanning && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <ScanIcon color="primary" />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Scanning receipt for details...
                            </Typography>
                            <LinearProgress />
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {/* OCR Results */}
                    {ocrText && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Scanned Receipt Details:
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                            {ocrText}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              {/* Actions */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Actions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={isSubmitting}
                      sx={{ bgcolor: 'primary.main' }}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Expense'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    💡 Tips
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      • Upload clear receipt photos for better OCR results
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Add location for travel-related expenses
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Use mileage tracking for vehicle expenses
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Categorize expenses for better reporting
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>
    </SMELayout>
  );
}
