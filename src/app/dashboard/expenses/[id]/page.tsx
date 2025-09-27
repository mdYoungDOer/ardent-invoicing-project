'use client';

import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Avatar
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  AttachFile as AttachFileIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { fetchExpenseById, deleteExpense } from '@/lib/supabase-queries';
import { formatCurrency, getCurrencyFlag } from '@/lib/exchange-rates';
import SMELayout from '@/components/sme/SMELayout';

export default function ViewExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;
  
  const { user, tenant, setLoading, setError, removeExpenseFromStore } = useAppStore();
  const [expense, setExpense] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (expenseId && tenant?.id) {
      loadExpense();
    }
  }, [expenseId, tenant?.id]);

  const loadExpense = async () => {
    if (!expenseId || !tenant?.id) return;
    
    try {
      setIsLoading(true);
      const expenseData = await fetchExpenseById(expenseId, tenant.id);
      
      if (!expenseData) {
        setError('Expense not found');
        router.push('/dashboard/expenses');
        return;
      }

      setExpense(expenseData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load expense');
      router.push('/dashboard/expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expense || !confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      setIsDeleting(true);
      await deleteExpense(expense.id);
      removeExpenseFromStore(expense.id);
      router.push('/dashboard/expenses');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/expenses/${expenseId}/edit`);
  };

  const handleViewReceipt = () => {
    if (expense?.receipt_url) {
      window.open(expense.receipt_url, '_blank');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
      'Office Supplies': 'primary',
      'Travel': 'secondary',
      'Meals': 'success',
      'Transportation': 'warning',
      'Marketing': 'error',
      'Software': 'info',
      'Utilities': 'primary',
      'Professional Services': 'secondary',
      'Equipment': 'success',
      'Other': 'warning',
    };
    return colors[category] || 'default';
  };

  if (isLoading) {
    return (
      <SMELayout title="View Expense">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </SMELayout>
    );
  }

  if (!expense) {
    return (
      <SMELayout title="View Expense">
        <Box sx={{ p: 4 }}>
          <Alert severity="error">Expense not found</Alert>
        </Box>
      </SMELayout>
    );
  }

  return (
    <SMELayout title="View Expense">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Expense Details
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Main Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Expense Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Description */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {expense.description}
                    </Typography>
                  </Box>

                  {/* Amount and Currency */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Amount
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {getCurrencyFlag(expense.currency)} {formatCurrency(expense.amount, expense.currency)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Currency
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {expense.currency}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Category and Type */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Category
                      </Typography>
                      <Chip
                        label={expense.category}
                        color={getCategoryColor(expense.category) as any}
                        icon={<CategoryIcon />}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Type
                      </Typography>
                      <Chip
                        label={expense.is_business ? 'Business' : 'Personal'}
                        color={expense.is_business ? 'success' : 'default'}
                        icon={<BusinessIcon />}
                      />
                    </Box>
                  </Box>

                  {/* Date */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Expense Date
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="action" />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(expense.expense_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Location */}
                  {expense.location && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Location
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon color="action" />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {expense.location}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Mileage */}
                  {expense.mileage_distance && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Mileage Distance
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CarIcon color="action" />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {expense.mileage_distance} km
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Tags */}
                  {expense.tags && expense.tags.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {expense.tags.map((tag: string, index: number) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Receipt */}
            {expense.receipt_url && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Receipt
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                      <ReceiptIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Button
                      variant="contained"
                      startIcon={<AttachFileIcon />}
                      onClick={handleViewReceipt}
                      fullWidth
                    >
                      View Receipt
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* OCR Text */}
            {expense.ocr_text && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Scanned Details
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {expense.ocr_text}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Details
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {new Date(expense.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(expense.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </SMELayout>
  );
}
