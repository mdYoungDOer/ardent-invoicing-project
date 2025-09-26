'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Cookie as CookieIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useState } from 'react';

export default function CookiesPolicyPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  const sections = [
    {
      title: "1. What Are Cookies?",
      content: "Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our site, and enabling certain functionality. Cookies can be 'session cookies' (temporary) or 'persistent cookies' (stored for longer periods)."
    },
    {
      title: "2. How We Use Cookies",
      content: "We use cookies to enhance your experience on our platform, analyze usage patterns, provide personalized content, ensure security, and improve our services. Cookies help us understand which features are most popular, identify technical issues, and optimize our platform's performance."
    },
    {
      title: "3. Types of Cookies We Use",
      content: "We use several types of cookies: Necessary cookies (essential for website functionality), Analytics cookies (help us understand user behavior), Marketing cookies (for targeted advertising), and Functional cookies (remember your preferences). Each type serves a specific purpose in improving your experience."
    },
    {
      title: "4. Third-Party Cookies",
      content: "Some cookies on our site are set by third-party services we use, such as analytics providers, payment processors, and customer support tools. These third parties have their own privacy policies and cookie practices. We ensure all third-party services comply with applicable data protection laws."
    },
    {
      title: "5. Cookie Management",
      content: "You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies, delete existing cookies, or receive notifications before cookies are set. However, disabling certain cookies may affect the functionality of our website and your user experience."
    },
    {
      title: "6. Legal Basis for Cookie Use",
      content: "We use cookies based on different legal grounds: necessary cookies are used for legitimate interests in website functionality, analytics cookies require your consent, and marketing cookies require explicit opt-in consent. We ensure all cookie usage complies with applicable privacy laws."
    },
    {
      title: "7. Data Retention",
      content: "Different cookies have different retention periods. Session cookies are deleted when you close your browser, while persistent cookies remain for specified periods (typically 30 days to 2 years). We regularly review and update our cookie retention periods to ensure they are appropriate for their purpose."
    },
    {
      title: "8. International Transfers",
      content: "Some of our cookie providers may be located outside Ghana. When we transfer cookie data internationally, we ensure appropriate safeguards are in place, including standard contractual clauses and adequacy decisions, to protect your privacy and comply with applicable laws."
    },
    {
      title: "9. Your Rights",
      content: "You have the right to withdraw consent for non-necessary cookies at any time, access information about cookies we use, request deletion of cookie data, and object to certain types of cookie processing. You can exercise these rights through our cookie consent management tool or by contacting us directly."
    },
    {
      title: "10. Updates to This Policy",
      content: "We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes and update the 'Last Updated' date. We encourage you to review this policy periodically to stay informed about our cookie practices."
    }
  ];

  const cookieTypes = [
    {
      name: "Necessary Cookies",
      description: "Essential for website functionality and security",
      examples: "Authentication, security, load balancing",
      retention: "Session or 1 year",
      required: true,
      icon: <SecurityIcon />
    },
    {
      name: "Analytics Cookies",
      description: "Help us understand how visitors use our website",
      examples: "Google Analytics, user behavior tracking",
      retention: "2 years",
      required: false,
      icon: <AnalyticsIcon />
    },
    {
      name: "Marketing Cookies",
      description: "Used to deliver relevant advertisements",
      examples: "Facebook Pixel, Google Ads, remarketing",
      retention: "1 year",
      required: false,
      icon: <SettingsIcon />
    },
    {
      name: "Functional Cookies",
      description: "Remember your preferences and settings",
      examples: "Language preferences, theme settings",
      retention: "1 year",
      required: false,
      icon: <CheckCircleIcon />
    }
  ];

  const handleCookiePreferenceChange = (type: string) => {
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Header currentPath="/cookies" />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #a67c00 0%, #746354 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <CookieIcon sx={{ fontSize: 64, color: 'white' }} />
          </Box>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              lineHeight: 1.2
            }}
          >
            Cookies Policy
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              maxWidth: 800,
              mx: 'auto'
            }}
          >
            Learn about how we use cookies to enhance your experience and protect your privacy. 
            You have full control over your cookie preferences.
          </Typography>
          <Chip
            label="Last Updated: January 2025"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600
            }}
          />
        </Container>
      </Box>

      {/* Cookie Types Overview */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Types of Cookies We Use
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              We use different types of cookies to provide you with the best possible experience
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {cookieTypes.map((cookieType, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {cookieType.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {cookieType.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {cookieType.description}
                  </Typography>
                  <Chip
                    label={cookieType.required ? "Required" : "Optional"}
                    color={cookieType.required ? "error" : "primary"}
                    size="small"
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Cookie Preferences */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Paper
            elevation={2}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 3
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
              Manage Your Cookie Preferences
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              You can control which types of cookies we use. Note that disabling certain cookies may affect website functionality.
            </Typography>
            <Stack spacing={3}>
              {cookieTypes.map((cookieType, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 3,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {cookieType.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {cookieType.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Examples: {cookieType.examples} • Retention: {cookieType.retention}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cookiePreferences[cookieType.name.toLowerCase().replace(' cookies', '') as keyof typeof cookiePreferences]}
                        onChange={() => handleCookiePreferenceChange(cookieType.name.toLowerCase().replace(' cookies', ''))}
                        disabled={cookieType.required}
                      />
                    }
                    label=""
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Cookie Details Table */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            Detailed Cookie Information
          </Typography>
          <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Cookie Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Retention</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>session_id</TableCell>
                  <TableCell>Maintains user session</TableCell>
                  <TableCell>Necessary</TableCell>
                  <TableCell>Session</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>_ga</TableCell>
                  <TableCell>Google Analytics tracking</TableCell>
                  <TableCell>Analytics</TableCell>
                  <TableCell>2 years</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>_fbp</TableCell>
                  <TableCell>Facebook Pixel tracking</TableCell>
                  <TableCell>Marketing</TableCell>
                  <TableCell>3 months</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>theme_preference</TableCell>
                  <TableCell>Remembers user theme choice</TableCell>
                  <TableCell>Functional</TableCell>
                  <TableCell>1 year</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* Policy Content */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Table of Contents */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  position: 'sticky',
                  top: 100,
                  borderRadius: 3
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
                  Table of Contents
                </Typography>
                <Stack spacing={1}>
                  {sections.map((section, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        cursor: 'pointer',
                        '&:hover': {
                          color: 'primary.main',
                          fontWeight: 500
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {section.title}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* Main Content */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 4, md: 6 },
                  borderRadius: 3
                }}
              >
                <Stack spacing={4}>
                  {sections.map((section, index) => (
                    <Box key={index}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: 'primary.main',
                          fontSize: { xs: '1.25rem', md: '1.5rem' }
                        }}
                      >
                        {section.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.7,
                          color: 'text.primary',
                          fontSize: { xs: '0.95rem', md: '1rem' }
                        }}
                      >
                        {section.content}
                      </Typography>
                      {index < sections.length - 1 && (
                        <Divider sx={{ mt: 3, opacity: 0.3 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Questions About Cookies?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Our team is here to help you understand our cookie practices and manage your preferences.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CookieIcon color="primary" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  hello@ardentinvoicing.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  +233 54 832 7906
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
