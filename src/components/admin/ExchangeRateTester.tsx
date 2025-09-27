'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  testExchangeRateAPI,
  getExchangeRate,
  convertCurrency,
  getCacheStats,
  clearExchangeRateCache,
  getSupportedCurrencies,
  formatCurrency,
} from '@/lib/exchange-rates';

interface TestResult {
  success: boolean;
  apiKeyPresent: boolean;
  testRate?: {
    from: string;
    to: string;
    rate: number;
    timestamp: string;
  };
  error?: string;
}

export default function ExchangeRateTester() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [conversionTest, setConversionTest] = useState<{
    amount: number;
    from: string;
    to: string;
    result?: number;
    loading: boolean;
  }>({
    amount: 100,
    from: 'USD',
    to: 'GHS',
    loading: false,
  });

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = () => {
    const stats = getCacheStats();
    setCacheStats(stats);
  };

  const runAPITest = async () => {
    setIsLoading(true);
    try {
      const result = await testExchangeRateAPI();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        apiKeyPresent: !!process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
      loadCacheStats();
    }
  };

  const testConversion = async () => {
    setConversionTest(prev => ({ ...prev, loading: true }));
    try {
      const result = await convertCurrency(
        conversionTest.amount,
        conversionTest.from,
        conversionTest.to
      );
      setConversionTest(prev => ({ ...prev, result, loading: false }));
    } catch (error) {
      setConversionTest(prev => ({ 
        ...prev, 
        result: undefined, 
        loading: false 
      }));
    }
    loadCacheStats();
  };

  const clearCache = () => {
    clearExchangeRateCache();
    loadCacheStats();
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'success' : 'error';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircleIcon /> : <ErrorIcon />;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 700 }}>
        Exchange Rate System
      </Typography>

      <Grid container spacing={3}>
        {/* API Test Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  API Connectivity Test
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                  onClick={runAPITest}
                  disabled={isLoading}
                >
                  Test API
                </Button>
              </Box>

              {testResult && (
                <Alert 
                  severity={getStatusColor(testResult.success)} 
                  icon={getStatusIcon(testResult.success)}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {testResult.success ? 'API Test Successful' : 'API Test Failed'}
                  </Typography>
                  {testResult.error && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {testResult.error}
                    </Typography>
                  )}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    API Key Status:
                  </Typography>
                  <Chip
                    label={testResult?.apiKeyPresent ? 'Present' : 'Not Found'}
                    color={testResult?.apiKeyPresent ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                {testResult?.testRate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Test Rate (USD → GHS):
                    </Typography>
                    <Chip
                      label={`${testResult.testRate.rate.toFixed(4)}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                )}

                {testResult?.testRate && (
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(testResult.testRate.timestamp).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cache Management Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Cache Management
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearCache}
                  color="warning"
                >
                  Clear Cache
                </Button>
              </Box>

              {cacheStats && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Cached Rates:
                    </Typography>
                    <Chip
                      label={`${cacheStats.size} entries`}
                      color="info"
                      size="small"
                    />
                  </Box>

                  {cacheStats.entries.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Cache Entries:
                      </Typography>
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Currency Pair</TableCell>
                              <TableCell>Expires</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cacheStats.entries.slice(0, 5).map((entry: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{entry.key}</TableCell>
                                <TableCell>
                                  {new Date(entry.expires).toLocaleTimeString()}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={entry.isExpired ? 'Expired' : 'Valid'}
                                    color={entry.isExpired ? 'error' : 'success'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Currency Conversion Test */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Currency Conversion Test
              </Typography>

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Amount
                  </Typography>
                  <input
                    type="number"
                    value={conversionTest.amount}
                    onChange={(e) => setConversionTest(prev => ({ 
                      ...prev, 
                      amount: parseFloat(e.target.value) || 0 
                    }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    From
                  </Typography>
                  <select
                    value={conversionTest.from}
                    onChange={(e) => setConversionTest(prev => ({ ...prev, from: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  >
                    {getSupportedCurrencies().map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    To
                  </Typography>
                  <select
                    value={conversionTest.to}
                    onChange={(e) => setConversionTest(prev => ({ ...prev, to: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  >
                    {getSupportedCurrencies().map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Button
                    variant="contained"
                    onClick={testConversion}
                    disabled={conversionTest.loading}
                    startIcon={conversionTest.loading ? <CircularProgress size={16} /> : <TrendingUpIcon />}
                    fullWidth
                  >
                    Convert
                  </Button>
                </Grid>

                <Grid item xs={12} sm={2}>
                  {conversionTest.result !== undefined && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Result
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                        {formatCurrency(conversionTest.result, conversionTest.to)}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                System Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Supported Currencies
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {getSupportedCurrencies().map(currency => (
                          <Chip key={currency} label={currency} size="small" />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Environment
                      </Typography>
                      <Typography variant="body2">
                        API Key: {process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY ? '✅ Configured' : '❌ Not Found'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Alert severity="info" icon={<InfoIcon />}>
                    <Typography variant="body2">
                      <strong>Exchange Rate System:</strong><br />
                      • Rates are cached for 1 hour to improve performance<br />
                      • API key provides higher rate limits<br />
                      • Automatic fallback to cached rates if API fails<br />
                      • Supports real-time currency conversion
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
