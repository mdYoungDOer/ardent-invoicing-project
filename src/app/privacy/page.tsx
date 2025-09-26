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
  Alert,
  AlertTitle
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Security as SecurityIcon,
  DataUsage as DataUsageIcon,
  Shield as ShieldIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Lock as PrivacyIcon
} from '@mui/icons-material';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sections = [
    {
      title: "1. Introduction",
      content: "Ardent Invoicing ('we', 'our', or 'us') is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our invoicing and expense management platform. This policy complies with Ghana's Data Protection Act, 2012, and applicable international data protection laws including GDPR."
    },
    {
      title: "2. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes personal information like your name, email address, phone number, business information, and payment details. We also collect information automatically when you use our service, including device information, IP address, browser type, and usage patterns."
    },
    {
      title: "3. How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, communicate with you about products and services, and ensure the security of our platform. We may also use your information for analytics, research, and to comply with legal obligations."
    },
    {
      title: "4. Information Sharing and Disclosure",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted service providers who assist us in operating our platform, conducting our business, or serving our users, provided they agree to keep this information confidential."
    },
    {
      title: "5. Data Security",
      content: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, regular security assessments, access controls, and staff training on data protection."
    },
    {
      title: "6. Data Retention",
      content: "We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it in accordance with our data retention schedule."
    },
    {
      title: "7. Your Rights and Choices",
      content: "You have the right to access, update, correct, or delete your personal information. You can also object to the processing of your information, request data portability, or withdraw consent where applicable. To exercise these rights, please contact us using the information provided in the Contact section."
    },
    {
      title: "8. Cookies and Tracking Technologies",
      content: "We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences. For detailed information about our use of cookies, please refer to our Cookies Policy."
    },
    {
      title: "9. International Data Transfers",
      content: "Your information may be transferred to and processed in countries other than Ghana. When we transfer your information internationally, we ensure appropriate safeguards are in place to protect your privacy and comply with applicable data protection laws, including standard contractual clauses and adequacy decisions."
    },
    {
      title: "10. Children's Privacy",
      content: "Our service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information promptly."
    },
    {
      title: "11. Third-Party Services",
      content: "Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party services you use. Our integration with payment processors and other service providers is governed by their respective privacy policies."
    },
    {
      title: "12. Business Transfers",
      content: "In the event of a merger, acquisition, or sale of all or part of our assets, your personal information may be transferred as part of that transaction. We will notify you of any such change in ownership or control of your personal information and provide you with choices regarding your information."
    },
    {
      title: "13. Legal Compliance",
      content: "We may disclose your information if required to do so by law or in response to valid requests by public authorities. We may also disclose information to protect our rights, property, or safety, or that of our users or the public, and to enforce our terms of service."
    },
    {
      title: "14. Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the 'Last Updated' date. We encourage you to review this policy periodically for any changes."
    },
    {
      title: "15. Contact Information",
      content: "If you have any questions about this Privacy Policy or our data practices, please contact us at hello@ardentinvoicing.com or +233 54 832 7906. Our Data Protection Officer can be reached at dpo@ardentinvoicing.com. Our registered address is 10A Mega Street, Adenta Municipality, Accra, Ghana."
    }
  ];

  const dataTypes = [
    {
      icon: <PersonIcon />,
      title: "Personal Information",
      description: "Name, email, phone number, and business details"
    },
    {
      icon: <BusinessIcon />,
      title: "Business Data",
      description: "Company information, invoices, and financial records"
    },
    {
      icon: <DataUsageIcon />,
      title: "Usage Analytics",
      description: "How you interact with our platform and features"
    },
    {
      icon: <SecurityIcon />,
      title: "Security Data",
      description: "Login attempts, IP addresses, and security logs"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Header currentPath="/privacy" />

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
            <PrivacyIcon sx={{ fontSize: 64, color: 'white' }} />
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
            Privacy Policy
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
            Your privacy is important to us. Learn how we collect, use, and protect your personal information 
            in compliance with Ghana's Data Protection Act and international standards.
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

      {/* Data Types Overview */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Types of Data We Collect
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              We collect only the information necessary to provide you with our services
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {dataTypes.map((dataType, index) => (
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
                    {dataType.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {dataType.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dataType.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Privacy Content */}
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

      {/* GDPR Compliance Notice */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            <AlertTitle sx={{ fontWeight: 600 }}>
              <ShieldIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              GDPR Compliance
            </AlertTitle>
            <Typography variant="body1" sx={{ mt: 1 }}>
              We are fully compliant with the General Data Protection Regulation (GDPR) and Ghana's Data Protection Act, 2012. 
              Your data is processed lawfully, fairly, and transparently. You have full control over your personal information 
              and can exercise your rights at any time.
            </Typography>
          </Alert>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Questions About Your Privacy?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Our privacy team is here to help you understand your rights and how we protect your data.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PrivacyIcon color="primary" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  hello@ardentinvoicing.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  dpo@ardentinvoicing.com
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
