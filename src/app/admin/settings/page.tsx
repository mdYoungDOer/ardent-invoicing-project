'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAppStore } from '@/lib/store';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSettings() {
  const { user } = useAppStore();
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Ardent Invoicing',
    siteDescription: 'Professional invoicing for Ghanaian SMEs',
    defaultCurrency: 'GHS',
    timezone: 'Africa/Accra',
    
    // Email Settings
    emailNotifications: true,
    emailFromName: 'Ardent Invoicing',
    emailFromAddress: 'noreply@ardentinvoicing.com',
    
    // Security Settings
    passwordMinLength: 8,
    requireEmailVerification: true,
    enableTwoFactor: false,
    
    // Feature Flags
    enablePaystack: true,
    enableSendGrid: true,
    enableOCR: true,
    enableAnalytics: true,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSave = () => {
    // Handle settings save logic here
    setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout title="Settings" user={user}>
      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1 }} />
                General Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Site Name"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Site Description"
                    multiline
                    rows={3}
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Default Currency</InputLabel>
                    <Select
                      value={settings.defaultCurrency}
                      label="Default Currency"
                      onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                    >
                      <MenuItem value="GHS">Ghana Cedis (GHS)</MenuItem>
                      <MenuItem value="USD">US Dollar (USD)</MenuItem>
                      <MenuItem value="EUR">Euro (EUR)</MenuItem>
                      <MenuItem value="GBP">British Pound (GBP)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      label="Timezone"
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                      <MenuItem value="Africa/Accra">Africa/Accra (GMT+0)</MenuItem>
                      <MenuItem value="Africa/Lagos">Africa/Lagos (GMT+1)</MenuItem>
                      <MenuItem value="Europe/London">Europe/London (GMT+0)</MenuItem>
                      <MenuItem value="America/New_York">America/New_York (GMT-5)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Email Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1 }} />
                Email Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label="Enable Email Notifications"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="From Name"
                    value={settings.emailFromName}
                    onChange={(e) => handleSettingChange('emailFromName', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="From Address"
                    type="email"
                    value={settings.emailFromAddress}
                    onChange={(e) => handleSettingChange('emailFromAddress', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1 }} />
                Security Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Minimum Password Length"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireEmailVerification}
                        onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                      />
                    }
                    label="Require Email Verification"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableTwoFactor}
                        onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                      />
                    }
                    label="Enable Two-Factor Authentication"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Feature Flags */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                Feature Flags
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enablePaystack}
                        onChange={(e) => handleSettingChange('enablePaystack', e.target.checked)}
                      />
                    }
                    label="Enable Paystack Payments"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableSendGrid}
                        onChange={(e) => handleSettingChange('enableSendGrid', e.target.checked)}
                      />
                    }
                    label="Enable SendGrid Email"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableOCR}
                        onChange={(e) => handleSettingChange('enableOCR', e.target.checked)}
                      />
                    }
                    label="Enable OCR Scanning"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableAnalytics}
                        onChange={(e) => handleSettingChange('enableAnalytics', e.target.checked)}
                      />
                    }
                    label="Enable Analytics"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  size="large"
                  sx={{ borderRadius: 2 }}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
