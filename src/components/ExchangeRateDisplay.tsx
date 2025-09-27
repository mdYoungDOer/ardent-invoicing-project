'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { getExchangeRate, formatCurrency, getCurrencyFlag } from '@/lib/exchange-rates';

interface ExchangeRateDisplayProps {
  fromCurrency: string;
  toCurrency: string;
  showRefresh?: boolean;
  compact?: boolean;
}

export default function ExchangeRateDisplay({ 
  fromCurrency, 
  toCurrency, 
  showRefresh = true,
  compact = false 
}: ExchangeRateDisplayProps) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRate = async () => {
    if (fromCurrency === toCurrency) {
      setRate(1);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rateData = await getExchangeRate(fromCurrency, toCurrency);
      setRate(rateData.rate);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exchange rate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, [fromCurrency, toCurrency]);

  if (fromCurrency === toCurrency) {
    return null;
  }

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {loading ? (
          <CircularProgress size={16} />
        ) : error ? (
          <Tooltip title={error}>
            <InfoIcon color="error" fontSize="small" />
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {getCurrencyFlag(fromCurrency)} 1 = {getCurrencyFlag(toCurrency)} {rate?.toFixed(4)}
          </Typography>
        )}
        {showRefresh && (
          <IconButton size="small" onClick={fetchRate} disabled={loading}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Exchange Rate
          </Typography>
          {showRefresh && (
            <IconButton size="small" onClick={fetchRate} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Fetching rate...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {rate && !error && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUpIcon color="primary" fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {getCurrencyFlag(fromCurrency)} 1 = {getCurrencyFlag(toCurrency)} {rate.toFixed(4)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip 
                label={`${formatCurrency(100, fromCurrency)} = ${formatCurrency(100 * rate, toCurrency)}`}
                size="small"
                variant="outlined"
              />
            </Box>

            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
