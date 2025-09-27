'use client';

import React from 'react';
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
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useAppStore } from '@/lib/store';
import AdminLayout from '@/components/admin/AdminLayout';

// Mock subscription data
const subscriptions = [
  {
    id: '1',
    name: 'Free Plan',
    price: 0,
    features: ['5 Invoices per month', 'Basic support', 'Standard templates'],
    tenantCount: 45,
    status: 'active'
  },
  {
    id: '2',
    name: 'Pro Plan',
    price: 29,
    features: ['Unlimited invoices', 'Priority support', 'Custom templates', 'Analytics'],
    tenantCount: 23,
    status: 'active'
  },
  {
    id: '3',
    name: 'Premium Plan',
    price: 59,
    features: ['Everything in Pro', 'API access', 'White-label', 'Advanced analytics'],
    tenantCount: 12,
    status: 'active'
  },
];

export default function AdminSubscriptions() {
  const { user } = useAppStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  return (
    <AdminLayout title="Subscriptions" user={user}>
      <Grid container spacing={3}>
        {/* Subscription Plans */}
        {subscriptions.map((plan) => (
          <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ${plan.price}
                      <Typography component="span" variant="body2" color="text.secondary">
                        /month
                      </Typography>
                    </Typography>
                  </Box>
                  <Chip 
                    label={plan.status.toUpperCase()} 
                    color={getStatusColor(plan.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Features:
                  </Typography>
                  {plan.features.map((feature, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      • {feature}
                    </Typography>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {plan.tenantCount} tenants
                  </Typography>
                  <Box>
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
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Subscription Analytics */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Subscription Analytics
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell>Active Subscriptions</TableCell>
                  <TableCell>Monthly Revenue</TableCell>
                  <TableCell>Growth Rate</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <MoneyIcon />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {plan.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {plan.tenantCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${(plan.price * plan.tenantCount).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="+12.5%" 
                        color="success" 
                        size="small" 
                      />
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
