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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import SMELayout from '@/components/sme/SMELayout';
import { formatCurrency } from '@/lib/exchange-rates';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  category: z.string().optional(),
  sku: z.string().optional(),
  stock_quantity: z.number().min(0, 'Stock quantity must be non-negative').optional(),
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  sku?: string;
  stock_quantity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

const PRODUCT_CATEGORIES = [
  'Software',
  'Services',
  'Physical Goods',
  'Digital Products',
  'Consulting',
  'Marketing',
  'Design',
  'Development',
  'Other'
];

const CURRENCIES = [
  { value: 'GHS', label: '🇬🇭 Ghana Cedis (GHS)' },
  { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
  { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
  { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
];

export default function ProductsPage() {
  const router = useRouter();
  const { tenant } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'GHS',
      category: '',
      sku: '',
      stock_quantity: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (tenant?.id) {
      loadProducts();
    }
  }, [tenant?.id]);

  const loadProducts = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleEditProduct = () => {
    if (selectedProduct) {
      setEditingProduct(selectedProduct);
      reset({
        ...selectedProduct,
        stock_quantity: selectedProduct.stock_quantity || 0,
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);

      if (error) throw error;
      
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    handleMenuClose();
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    reset({
      name: '',
      description: '',
      price: 0,
      currency: 'GHS',
      category: '',
      sku: '',
      stock_quantity: 0,
      is_active: true,
    });
    setOpenDialog(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!tenant?.id) return;

    try {
      setSubmitting(true);
      
      const productData = {
        ...data,
        tenant_id: tenant.id,
        description: data.description || null,
        category: data.category || null,
        sku: data.sku || null,
        stock_quantity: data.stock_quantity || null,
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
      }

      await loadProducts();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getProductInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
      'Software': 'primary',
      'Services': 'secondary',
      'Physical Goods': 'success',
      'Digital Products': 'info',
      'Consulting': 'warning',
      'Marketing': 'error',
      'Design': 'primary',
      'Development': 'secondary',
      'Other': 'default',
    };
    return colors[category] || 'default';
  };

  if (loading) {
    return (
      <SMELayout title="Products">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </SMELayout>
    );
  }

  return (
    <SMELayout title="Products">
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Products & Services
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProduct}
          >
            Add Product
          </Button>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder="Search products by name, description, or SKU..."
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
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterIcon />}
                >
                  Filter
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {getProductInitials(product.name)}
                    </Avatar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {!product.is_active && (
                        <Chip label="Inactive" color="warning" size="small" />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, product)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {product.name}
                  </Typography>
                  
                  {product.sku && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      SKU: {product.sku}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MoneyIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrency(product.price, product.currency)}
                    </Typography>
                  </Box>
                  
                  {product.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {product.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {product.category && (
                      <Chip
                        icon={<CategoryIcon />}
                        label={product.category}
                        color={getCategoryColor(product.category)}
                        size="small"
                      />
                    )}
                    {product.stock_quantity !== null && (
                      <Chip
                        icon={<InventoryIcon />}
                        label={`Stock: ${product.stock_quantity}`}
                        color={product.stock_quantity > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setEditingProduct(product);
                      reset({
                        ...product,
                        stock_quantity: product.stock_quantity || 0,
                      });
                      setOpenDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm || categoryFilter ? 'No products found' : 'No products yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || categoryFilter 
                ? 'Try adjusting your search criteria'
                : 'Add your first product or service to start managing your inventory'
              }
            </Typography>
            {!searchTerm && !categoryFilter && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProduct}
              >
                Add Product
              </Button>
            )}
          </Box>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditProduct}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDeleteProduct} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Product Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Product Name *"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="SKU"
                        error={!!errors.sku}
                        helperText={errors.sku?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Price *"
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        error={!!errors.price}
                        helperText={errors.price?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Category"
                        error={!!errors.category}
                        helperText={errors.category?.message}
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="stock_quantity"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Stock Quantity"
                        type="number"
                        inputProps={{ min: 0 }}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        error={!!errors.stock_quantity}
                        helperText={errors.stock_quantity?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : null}
              >
                {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </SMELayout>
  );
}
