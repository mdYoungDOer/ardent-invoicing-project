'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Search as SearchIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { formatCurrency, getCurrencyFlag } from '@/lib/exchange-rates';
import { motion } from 'framer-motion';

interface SMEUser {
  id: string;
  email: string;
  subscription_tier: string;
  subscription_status: string;
  invoice_quota_used: number;
  is_unlimited_free: boolean;
  created_at: string;
  tenants: {
    id: string;
    business_name: string;
    created_at: string;
  } | null;
}

export default function SMEManagementPage() {
  const [smes, setSmes] = useState<SMEUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSME, setSelectedSME] = useState<SMEUser | null>(null);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSMEs();
  }, []);

  const loadSMEs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          tenants!inner(id, business_name, created_at)
        `)
        .eq('role', 'sme')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSmes(data || []);
    } catch (error) {
      setError('Failed to load SME data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlimitedOverride = async (sme: SMEUser) => {
    setSelectedSME(sme);
    setShowOverrideDialog(true);
  };

  const confirmUnlimitedOverride = async () => {
    if (!selectedSME) return;
    
    setProcessing(true);
    setError('');
    
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          is_unlimited_free: !selectedSME.is_unlimited_free,
        })
        .eq('id', selectedSME.id);

      if (error) throw error;
      
      setSuccess(`Successfully ${selectedSME.is_unlimited_free ? 'removed' : 'granted'} unlimited access for ${selectedSME.tenants?.business_name}`);
      
      // Refresh data
      await loadSMEs();
      setShowOverrideDialog(false);
      setSelectedSME(null);
    } catch (error) {
      setError('Failed to update SME access');
    } finally {
      setProcessing(false);
    }
  };

  const getSubscriptionTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'success';
      case 'pro': return 'primary';
      case 'starter': return 'warning';
      case 'free': return 'default';
      default: return 'default';
    }
  };

  const getQuotaLimit = (tier: string) => {
    switch (tier) {
      case 'free': return 2;
      case 'starter': return 20;
      case 'pro': return 400;
      case 'enterprise': return 999999;
      default: return 2;
    }
  };

  const filteredSMEs = smes.filter(sme => 
    sme.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sme.tenants?.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalSMEs: smes.length,
    activeSubscriptions: smes.filter(s => s.subscription_status === 'active').length,
    unlimitedFree: smes.filter(s => s.is_unlimited_free).length,
    totalRevenue: smes.reduce((sum, sme) => {
      const monthlyRevenue = {
        free: 0,
        starter: 129,
        pro: 489,
        enterprise: 999,
      };
      return sum + (monthlyRevenue[sme.subscription_tier as keyof typeof monthlyRevenue] || 0);
    }, 0),
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            SME Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalStats.totalSMEs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total SMEs
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
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalStats.activeSubscriptions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Subscriptions
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
                  <StarIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalStats.unlimitedFree}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unlimited Free
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
                  <MoneyIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {getCurrencyFlag('GHS')} {formatCurrency(totalStats.totalRevenue, 'GHS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Revenue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* SME Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  SME Accounts
                </Typography>
                <TextField
                  placeholder="Search SMEs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  sx={{ minWidth: 300 }}
                />
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Business</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Subscription</TableCell>
                    <TableCell align="center">Quota Usage</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSMEs.map((sme) => (
                    <motion.tr
                      key={sme.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {sme.tenants?.business_name || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {sme.tenants?.id.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{sme.email}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Joined: {new Date(sme.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={sme.subscription_tier}
                            color={getSubscriptionTierColor(sme.subscription_tier)}
                            size="small"
                          />
                          {sme.is_unlimited_free && (
                            <Chip
                              label="Unlimited"
                              color="warning"
                              size="small"
                              icon={<StarIcon />}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2">
                            {sme.is_unlimited_free ? '∞' : `${sme.invoice_quota_used}/${getQuotaLimit(sme.subscription_tier)}`}
                          </Typography>
                          {!sme.is_unlimited_free && (
                            <Box sx={{ 
                              width: 100, 
                              height: 4, 
                              bgcolor: 'grey.200', 
                              borderRadius: 2, 
                              overflow: 'hidden',
                              mx: 'auto',
                              mt: 0.5
                            }}>
                              <Box sx={{ 
                                width: `${Math.min((sme.invoice_quota_used / getQuotaLimit(sme.subscription_tier)) * 100, 100)}%`,
                                height: '100%',
                                bgcolor: sme.invoice_quota_used >= getQuotaLimit(sme.subscription_tier) ? 'error.main' : 'primary.main',
                              }} />
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sme.subscription_status}
                          color={sme.subscription_status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleUnlimitedOverride(sme)}
                            color={sme.is_unlimited_free ? 'warning' : 'primary'}
                          >
                            {sme.is_unlimited_free ? <StarIcon /> : <BlockIcon />}
                          </IconButton>
                        </Box>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredSMEs.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No SMEs found matching your criteria.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Container>

      {/* Unlimited Override Dialog */}
      <Dialog open={showOverrideDialog} onClose={() => setShowOverrideDialog(false)}>
        <DialogTitle>
          {selectedSME?.is_unlimited_free ? 'Remove' : 'Grant'} Unlimited Access
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {selectedSME?.is_unlimited_free 
              ? `Remove unlimited access for ${selectedSME.tenants?.business_name}? They will return to their subscription tier limits.`
              : `Grant unlimited access to ${selectedSME?.tenants?.business_name}? This will bypass their subscription tier invoice limits.`
            }
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={!selectedSME?.is_unlimited_free}
                onChange={() => setSelectedSME(prev => prev ? { ...prev, is_unlimited_free: !prev.is_unlimited_free } : null)}
              />
            }
            label={selectedSME?.is_unlimited_free ? 'Remove unlimited access' : 'Grant unlimited access'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOverrideDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmUnlimitedOverride}
            variant="contained"
            disabled={processing}
            sx={{ bgcolor: 'primary.main' }}
          >
            {processing ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
