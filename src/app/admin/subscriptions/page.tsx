'use client';

import React, { useState, useEffect } from 'react';
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
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { formatCurrency } from '@/lib/exchange-rates';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSubscriptions() {
  const { user } = useAppStore();
  const [planStats, setPlanStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPlanStats = async () => {
      try {
        const { data: tenants, error } = await supabase
          .from('tenants')
          .select('subscription_tier');

        if (error) throw error;

        const stats = tenants?.reduce((acc, tenant) => {
          const tier = tenant.subscription_tier || 'free';
          acc[tier] = (acc[tier] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        setPlanStats(stats);
      } catch (error) {
        console.error('Error fetching plan stats:', error);
      }
    };

    fetchPlanStats();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getTotalRevenue = () => {
    return SUBSCRIPTION_PLANS.reduce((total, plan) => {
      const tenantCount = planStats[plan.id] || 0;
      return total + (plan.price.monthly * tenantCount);
    }, 0);
  };

  return (
    <AdminLayout title="Subscriptions" user={user}>
      <Grid container spacing={3}>
        {/* Subscription Plans */}
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrency(plan.price.monthly, 'GHS')}
                      <Typography component="span" variant="body2" color="text.secondary">
                        /month
                      </Typography>
                    </Typography>
                  </Box>
                  <Chip 
                    label="ACTIVE" 
                    color="success"
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
                    {planStats[plan.id] || 0} tenants
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
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const tenantCount = planStats[plan.id] || 0;
                  const monthlyRevenue = plan.price.monthly * tenantCount;
                  
                  return (
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
                          {tenantCount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(monthlyRevenue, 'GHS')}
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
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
