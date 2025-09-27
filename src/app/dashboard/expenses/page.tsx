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
  Fab,
  Avatar
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  MoreVert as MoreIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { fetchExpenses, searchExpenses } from '@/lib/supabase-queries';
import { formatCurrency, getCurrencySymbol, getCurrencyFlag } from '@/lib/exchange-rates';
import type { Expense } from '@/lib/store';
import SMELayout from '@/components/sme/SMELayout';

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

export default function ExpensesPage() {
  const router = useRouter();
  const { user, tenant, expenses, setExpenses, setLoading, setError } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (tenant?.id) {
      loadExpenses();
    }
  }, [tenant?.id]);

  const loadExpenses = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      const data = await fetchExpenses(tenant.id);
      setExpenses(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      const data = await searchExpenses(tenant.id, searchTerm, {
        category: categoryFilter || undefined,
      });
      setExpenses(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to search expenses');
    } finally {
      setLoading(false);
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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, expense: Expense) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const handleEditExpense = () => {
    if (selectedExpense) {
      router.push(`/dashboard/expenses/${selectedExpense.id}/edit`);
    }
    handleMenuClose();
  };

  const handleViewReceipt = () => {
    if (selectedExpense?.receipt_url) {
      window.open(selectedExpense.receipt_url, '_blank');
    }
    handleMenuClose();
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchTerm === '' || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || expense.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const businessExpenses = filteredExpenses
    .filter(expense => expense.is_business)
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <SMELayout title="Expenses">
      <Box sx={{ p: 4 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {getCurrencyFlag('GHS')} {formatCurrency(totalExpenses, 'GHS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {getCurrencyFlag('GHS')} {formatCurrency(businessExpenses, 'GHS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Business Expenses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <CarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {expenses.filter(e => e.mileage_distance).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mileage Entries
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <AttachFileIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {expenses.filter(e => e.receipt_url).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      With Receipts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search expenses..."
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
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
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

        {/* Expenses Grid */}
        <Grid container spacing={3}>
          {filteredExpenses.map((expense) => (
            <Grid item xs={12} sm={6} md={4} key={expense.id}>
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
                    <Chip
                      label={expense.category}
                      color={getCategoryColor(expense.category)}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, expense)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {expense.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {getCurrencyFlag(expense.currency)} {formatCurrency(expense.amount, expense.currency)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </Typography>
                  
                  {expense.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {expense.location}
                      </Typography>
                    </Box>
                  )}
                  
                  {expense.mileage_distance && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {expense.mileage_distance} km
                      </Typography>
                    </Box>
                  )}
                  
                  {expense.tags && expense.tags.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {expense.tags.slice(0, 3).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    {expense.receipt_url && (
                      <IconButton
                        size="small"
                        onClick={() => window.open(expense.receipt_url, '_blank')}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/dashboard/expenses/${expense.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Chip
                    label={expense.is_business ? 'Business' : 'Personal'}
                    color={expense.is_business ? 'success' : 'default'}
                    size="small"
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredExpenses.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No expenses found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Track your business expenses to manage your finances better
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/expenses/new')}
              sx={{ bgcolor: 'primary.main' }}
            >
              Add Expense
            </Button>
          </Box>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditExpense}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          {selectedExpense?.receipt_url && (
            <MenuItem onClick={handleViewReceipt}>
              <ReceiptIcon sx={{ mr: 1 }} />
              View Receipt
            </MenuItem>
          )}
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Box>
    </SMELayout>
  );
}
