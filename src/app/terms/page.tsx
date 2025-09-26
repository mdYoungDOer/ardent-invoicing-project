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
  useMediaQuery
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Gavel as GavelIcon,
  Security as SecurityIcon,
  AccountBalance as AccountBalanceIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsOfUsePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using Ardent Invoicing ('Service'), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Description of Service",
      content: "Ardent Invoicing is a comprehensive invoicing and expense management platform designed specifically for Ghanaian small and medium-sized enterprises (SMEs). Our service includes but is not limited to: invoice creation and management, expense tracking, payment processing, financial reporting, and business analytics."
    },
    {
      title: "3. User Accounts and Registration",
      content: "To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account."
    },
    {
      title: "4. Acceptable Use Policy",
      content: "You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. You may not use the Service in any manner that could damage, disable, overburden, or impair any server, or the network(s) connected to any server, or interfere with any other party's use and enjoyment of the Service."
    },
    {
      title: "5. Payment Terms and Billing",
      content: "Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. You authorize us to charge your payment method for all applicable fees. Prices are subject to change with 30 days' notice. Payment is due in Ghana Cedis (GHS) unless otherwise specified."
    },
    {
      title: "6. Data Protection and Privacy",
      content: "We are committed to protecting your privacy and personal data in accordance with Ghana's Data Protection Act, 2012, and applicable international data protection laws. Our collection, use, and disclosure of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference."
    },
    {
      title: "7. Intellectual Property Rights",
      content: "The Service and its original content, features, and functionality are and will remain the exclusive property of Ardent Invoicing and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent."
    },
    {
      title: "8. Service Availability",
      content: "We strive to maintain high service availability but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) temporarily or permanently with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service."
    },
    {
      title: "9. Limitation of Liability",
      content: "In no event shall Ardent Invoicing, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service."
    },
    {
      title: "10. Indemnification",
      content: "You agree to defend, indemnify, and hold harmless Ardent Invoicing and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees)."
    },
    {
      title: "11. Termination",
      content: "We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. Upon termination, your right to use the Service will cease immediately."
    },
    {
      title: "12. Governing Law and Jurisdiction",
      content: "These Terms shall be interpreted and governed by the laws of Ghana. Any dispute arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the courts of Ghana. You consent to the personal jurisdiction of such courts and waive any objection to such courts on the grounds of venue or forum non conveniens."
    },
    {
      title: "13. Changes to Terms",
      content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion."
    },
    {
      title: "14. Contact Information",
      content: "If you have any questions about these Terms of Use, please contact us at hello@ardentinvoicing.com or +233 54 832 7906. Our registered address is 10A Mega Street, Adenta Municipality, Accra, Ghana."
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Header currentPath="/terms" />

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
            <GavelIcon sx={{ fontSize: 64, color: 'white' }} />
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
            Terms of Use
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
            Please read these terms carefully before using Ardent Invoicing. 
            By using our service, you agree to be bound by these terms.
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

      {/* Terms Content */}
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
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Questions About These Terms?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Our legal team is here to help clarify any questions you may have about our terms of use.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  hello@ardentinvoicing.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon color="primary" />
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
