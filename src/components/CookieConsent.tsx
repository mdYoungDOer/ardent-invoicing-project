'use client';

import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Collapse,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Cookie as CookieIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookieConsentProps {
  onAccept?: (preferences: CookiePreferences) => void;
  onReject?: () => void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieConsent({ onAccept, onReject }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setPreferences(allPreferences);
    localStorage.setItem('cookie-consent', JSON.stringify(allPreferences));
    setShowBanner(false);
    onAccept?.(allPreferences);
  };

  const handleRejectAll = () => {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setPreferences(minimalPreferences);
    localStorage.setItem('cookie-consent', JSON.stringify(minimalPreferences));
    setShowBanner(false);
    onReject?.();
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    onAccept?.(preferences);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      name: 'Necessary Cookies',
      description: 'Essential for website functionality and security',
      required: true
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors use our website',
      required: false
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements',
      required: false
    },
    {
      key: 'functional' as keyof CookiePreferences,
      name: 'Functional Cookies',
      description: 'Remember your preferences and settings',
      required: false
    }
  ];

  if (!showBanner) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        p: 2,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 600,
          mx: 'auto',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CookieIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Cookie Consent
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                We use cookies to enhance your experience
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setShowBanner(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            We use cookies to provide you with the best possible experience on our website. 
            Some cookies are necessary for the website to function, while others help us analyze 
            usage and improve our services. You can choose which cookies to accept.
          </Typography>

          {/* Quick Actions */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleAcceptAll}
              startIcon={<CheckCircleIcon />}
              sx={{ flex: 1 }}
            >
              Accept All
            </Button>
            <Button
              variant="outlined"
              onClick={handleRejectAll}
              startIcon={<WarningIcon />}
              sx={{ flex: 1 }}
            >
              Reject All
            </Button>
            <Button
              variant="text"
              onClick={() => setShowDetails(!showDetails)}
              startIcon={<SettingsIcon />}
            >
              Customize
            </Button>
          </Stack>

          {/* Detailed Preferences */}
          <Collapse in={showDetails}>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Cookie Preferences
              </Typography>
              <Stack spacing={2}>
                {cookieTypes.map((cookieType) => (
                  <Box
                    key={cookieType.key}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {cookieType.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cookieType.description}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences[cookieType.key]}
                          onChange={() => handlePreferenceChange(cookieType.key)}
                          disabled={cookieType.required}
                        />
                      }
                      label=""
                    />
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                  variant="outlined"
                  component={Link}
                  href="/cookies"
                  startIcon={<InfoIcon />}
                >
                  Learn More
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSavePreferences}
                  startIcon={<CheckCircleIcon />}
                >
                  Save Preferences
                </Button>
              </Stack>
            </Box>
          </Collapse>

          {/* Legal Notice */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <AlertTitle>Your Privacy Rights</AlertTitle>
            <Typography variant="body2">
              By using our website, you consent to our use of cookies as described in our{' '}
              <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link href="/cookies" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Cookies Policy
              </Link>
              . You can change your preferences at any time.
            </Typography>
          </Alert>
        </Box>
      </Paper>
    </Box>
  );
}
