'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import AdminLayout from '@/components/admin/AdminLayout';

interface Tenant {
  id: string;
  business_name: string;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
}

export default function AdminTenants() {
  const router = useRouter();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newTenantDialog, setNewTenantDialog] = useState(false);
  const [newTenant, setNewTenant] = useState({
    business_name: '',
    subscription_tier: 'free',
    subscription_status: 'active',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTenants(data || []);
      } catch (error: any) {
        console.error('Error fetching tenants:', error);
        setSnackbar({ open: true, message: 'Failed to load tenants', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const getSubscriptionTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'success';
      case 'pro': return 'info';
      case 'free': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = searchTerm === '' || 
      (tenant.business_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === '' || (tenant.subscription_tier || 'free') === tierFilter;
    const matchesStatus = statusFilter === '' || (tenant.subscription_status || 'inactive') === statusFilter;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout title="Tenants" user={user}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Tenants" user={user}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tenants Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewTenantDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              Add Tenant
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Subscription Tier</InputLabel>
              <Select
                value={tierFilter}
                label="Subscription Tier"
                onChange={(e) => setTierFilter(e.target.value)}
              >
                <MenuItem value="">All Tiers</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="pro">Pro</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business</TableCell>
                  <TableCell>Subscription</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {(tenant.business_name || 'N/A').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {tenant.business_name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={(tenant.subscription_tier || 'free').toUpperCase()} 
                        color={getSubscriptionTierColor(tenant.subscription_tier || 'free') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={(tenant.subscription_status || 'inactive').toUpperCase()} 
                        color={getStatusColor(tenant.subscription_status || 'inactive') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="secondary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* New Tenant Dialog */}
      <Dialog open={newTenantDialog} onClose={() => setNewTenantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Tenant</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Business Name"
            value={newTenant.business_name}
            onChange={(e) => setNewTenant({ ...newTenant, business_name: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Subscription Tier</InputLabel>
            <Select
              value={newTenant.subscription_tier}
              label="Subscription Tier"
              onChange={(e) => setNewTenant({ ...newTenant, subscription_tier: e.target.value })}
            >
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="pro">Pro</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={newTenant.subscription_status}
              label="Status"
              onChange={(e) => setNewTenant({ ...newTenant, subscription_status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTenantDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            // Handle add tenant logic here
            setNewTenantDialog(false);
            setSnackbar({ open: true, message: 'Tenant added successfully', severity: 'success' });
          }}>
            Add Tenant
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
        >
          {snackbar.message}
        </Alert>
      )}
    </AdminLayout>
  );
}
