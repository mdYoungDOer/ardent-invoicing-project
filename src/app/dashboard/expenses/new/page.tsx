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
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/lib/store';
import { createExpense, uploadReceipt } from '@/lib/supabase-queries';
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

export default function NewExpensePage() {
  const router = useRouter();
  const { user, tenant, setLoading, setError, addExpense } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
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
      
      // Dynamic import of Tesseract
      const Tesseract = await import('tesseract.js');
      
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      setOcrText(text);
      
      // Try to extract amount and description from OCR text
      extractExpenseData(text);
      
    } catch (error) {
      console.error('OCR scanning failed:', error);
      setError('Failed to scan receipt. Please enter details manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const extractExpenseData = (text: string) => {
    // Simple regex patterns to extract common data
    const amountMatch = text.match(/(\d+\.?\d*)/g);
    if (amountMatch) {
      const amounts = amountMatch.map(match => parseFloat(match)).filter(amount => amount > 0);
      if (amounts.length > 0) {
        const maxAmount = Math.max(...amounts);
        if (maxAmount > 1) { // Likely a real amount
          setValue('amount', maxAmount);
        }
      }
    }

    // Try to extract description (first line or common patterns)
    const lines = text.split('\n').filter(line => line.trim().length > 3);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length < 50) { // Reasonable description length
        setValue('description', firstLine);
      }
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo'}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted;
              setLocation(address);
              setValue('location', address);
            }
          }
        } catch (error) {
          console.error('Geocoding failed:', error);
          setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          setValue('location', `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to get your location. Please enter manually.');
        setIsGettingLocation(false);
      }
    );
  };

  const calculateMileage = () => {
    // This would integrate with a mapping service to calculate distance
    // For now, we'll show a placeholder
    setValue('mileage_distance', 0);
  };

  const onSubmit = async (data: CreateExpenseData) => {
    if (!user || !tenant) return;

    try {
      setIsSubmitting(true);

      let receiptUrl = '';
      
      // Upload receipt if selected
      if (selectedFile) {
        const fileName = `${tenant.id}/${Date.now()}-${selectedFile.name}`;
        receiptUrl = await uploadReceipt(selectedFile, fileName);
      }

      // Create expense
      const expenseData = {
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

      const expense = await createExpense(expenseData);
      addExpense(expense);
      
      router.push('/dashboard/expenses');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setOcrText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <SMELayout title="Add New Expense">
      <Box sx={{ p: 4 }}>
        {/* Header Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Add New Expense
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            sx={{ bgcolor: 'primary.main' }}
          >
            {isSubmitting ? <CircularProgress size={20} /> : 'Save Expense'}
          </Button>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            {/* Receipt Upload */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Receipt (Optional)
                  </Typography>
                  
                  {!selectedFile ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      
                      <Button
                        variant="outlined"
                        startIcon={<CameraIcon />}
                        onClick={handleCameraCapture}
                        sx={{ mr: 2 }}
                      >
                        Take Photo
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<AttachFileIcon />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload File
                      </Button>
                    </Box>
                  ) : (
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedFile.name}
                        </Typography>
                        <IconButton onClick={removeFile} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      {isScanning && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Scanning receipt...
                          </Typography>
                          <LinearProgress />
                        </Box>
                      )}
                      
                      {ocrText && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Extracted Text:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            bgcolor: 'grey.50', 
                            p: 1, 
                            borderRadius: 1,
                            maxHeight: 100,
                            overflow: 'auto'
                          }}>
                            {ocrText}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Expense Details */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Expense Details
                  </Typography>
                  
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description *"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Amount *"
                            type="number"
                            InputProps={{
                              startAdornment: getCurrencyFlag(watch('currency')) + ' ',
                            }}
                            error={!!errors.amount}
                            helperText={errors.amount?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
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
                  </Grid>

                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Category *"
                        error={!!errors.category}
                        helperText={errors.category?.message}
                        sx={{ mt: 2 }}
                      >
                        {EXPENSE_CATEGORIES.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name="expense_date"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Date *"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.expense_date}
                        helperText={errors.expense_date?.message}
                        sx={{ mt: 2 }}
                      />
                    )}
                  />

                  <Controller
                    name="is_business"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Type"
                        sx={{ mt: 2 }}
                      >
                        <MenuItem value={true}>Business Expense</MenuItem>
                        <MenuItem value={false}>Personal Expense</MenuItem>
                      </TextField>
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Location & Mileage */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Location & Mileage
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Location"
                          error={!!errors.location}
                          helperText={errors.location?.message}
                        />
                      )}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<LocationIcon />}
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      {isGettingLocation ? <CircularProgress size={20} /> : 'Get'}
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Controller
                      name="mileage_distance"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Mileage (km)"
                          type="number"
                          error={!!errors.mileage_distance}
                          helperText={errors.mileage_distance?.message}
                        />
                      )}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<ScanIcon />}
                      onClick={calculateMileage}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Calc
                    </Button>
                  </Box>

                  {location && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Current location: {location}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Tags (Optional)
                  </Typography>
                  
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Tags (comma-separated)"
                        placeholder="urgent, client-meeting, travel"
                        helperText="Add tags to help categorize and find expenses later"
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                          field.onChange(tags);
                        }}
                        value={field.value?.join(', ') || ''}
                      />
                    )}
                  />
                  
                  {watch('tags') && watch('tags')!.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {watch('tags')!.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>
    </SMELayout>
  );
}
