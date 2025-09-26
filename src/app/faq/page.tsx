'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card,
  CardContent,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { Grid } from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  Support as SupportIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function FAQPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const faqCategories = [
    {
      title: "General Questions",
      icon: <HelpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      questions: [
        {
          question: "What is Ardent Invoicing?",
          answer: "Ardent Invoicing is a comprehensive invoicing and expense management platform designed specifically for Ghanaian SMEs. We help businesses create professional invoices, track expenses, and manage their finances with GHS support and local compliance features."
        },
        {
          question: "Who can use Ardent Invoicing?",
          answer: "Ardent Invoicing is designed for Ghanaian small and medium enterprises (SMEs), freelancers, consultants, and any business that needs professional invoicing and expense management. Our platform is suitable for businesses of all sizes."
        },
        {
          question: "Do I need any special software to use Ardent Invoicing?",
          answer: "No special software is required. Ardent Invoicing is a web-based platform that works in any modern web browser. We also have mobile apps for iOS and Android for managing your business on the go."
        },
        {
          question: "Is there a free trial available?",
          answer: "Yes! We offer a 14-day free trial for all paid plans. No credit card is required to start your trial. You can explore all features and see how Ardent Invoicing can benefit your business."
        }
      ]
    },
    {
      title: "Pricing & Billing",
      icon: <PaymentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      questions: [
        {
          question: "What are your pricing plans?",
          answer: "We offer four plans: Free (₵0/month), Starter (₵129/month), Pro (₵489/month), and Enterprise (₵999/month). Each plan includes different features and invoice limits. You can upgrade or downgrade at any time."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, mobile money (MTN, Vodafone, AirtelTigo), and bank transfers in Ghana. All payments are processed securely through our payment partners."
        },
        {
          question: "Can I change my plan anytime?",
          answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences. You can also cancel your subscription at any time."
        },
        {
          question: "Do you offer discounts for annual payments?",
          answer: "Yes! We offer a 20% discount for annual payments. This can save you significant money compared to monthly billing. Contact our sales team for more information about annual pricing."
        }
      ]
    },
    {
      title: "Security & Compliance",
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      questions: [
        {
          question: "Is my data secure?",
          answer: "Absolutely. We use bank-level security with end-to-end encryption, secure data centers, and regular security audits. Your data is protected with the same security standards used by major financial institutions."
        },
        {
          question: "Is Ardent Invoicing compliant with Ghana tax laws?",
          answer: "Yes, our platform is designed to help you stay compliant with Ghana tax regulations. We include VAT calculations, tax reporting features, and generate reports that meet GRA requirements."
        },
        {
          question: "Where is my data stored?",
          answer: "Your data is stored in secure, encrypted cloud servers. We use industry-leading cloud providers with data centers that meet international security standards. Your data is backed up regularly and protected against loss."
        },
        {
          question: "Can I export my data?",
          answer: "Yes, you can export all your data at any time. We provide export options for invoices, expenses, and reports in various formats including PDF, Excel, and CSV. Your data belongs to you."
        }
      ]
    },
    {
      title: "Features & Usage",
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      questions: [
        {
          question: "Can I customize my invoices?",
          answer: "Yes! You can customize your invoices with your business logo, colors, and branding. You can also create custom invoice templates and add your business information to maintain a professional appearance."
        },
        {
          question: "Does Ardent Invoicing support multiple currencies?",
          answer: "Yes, we support multiple currencies including GHS (Ghana Cedis), USD, EUR, and GBP. You can invoice in different currencies and we'll handle the exchange rate calculations automatically."
        },
        {
          question: "Can I track expenses with receipts?",
          answer: "Absolutely! You can upload receipt photos and our system will automatically extract the information using OCR technology. You can categorize expenses, add notes, and generate expense reports for tax purposes."
        },
        {
          question: "Is there a mobile app?",
          answer: "Yes, we have mobile apps for both iOS and Android. You can create invoices, track expenses, view reports, and manage your business from anywhere using your mobile device."
        },
        {
          question: "Can multiple team members use the same account?",
          answer: "Yes, depending on your plan. Starter plans include 2 users, Pro plans include 10 users, and Enterprise plans include unlimited users. You can assign different roles and permissions to team members."
        }
      ]
    },
    {
      title: "Support & Help",
      icon: <SupportIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      questions: [
        {
          question: "What kind of support do you offer?",
          answer: "We offer multiple support channels including email support, live chat, phone support (for Pro and Enterprise plans), and a comprehensive help center with tutorials and guides."
        },
        {
          question: "How quickly do you respond to support requests?",
          answer: "We aim to respond to all support requests within 24 hours. Pro and Enterprise customers receive priority support with faster response times. Critical issues are addressed immediately."
        },
        {
          question: "Do you offer training for new users?",
          answer: "Yes! We provide onboarding assistance, video tutorials, and can arrange training sessions for your team. We want to ensure you get the most out of Ardent Invoicing."
        },
        {
          question: "Is there a user community or forum?",
          answer: "Yes, we have an active user community where you can connect with other Ghanaian businesses, share tips, ask questions, and learn from each other's experiences."
        }
      ]
    }
  ];

  const contactInfo = [
    {
      icon: <PhoneIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      details: "+233 54 832 7906",
      availability: "Mon-Fri: 8AM-6PM GMT"
    },
    {
      icon: <EmailIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Email Support",
      description: "Send us your questions anytime",
      details: "hello@ardentinvoicing.com",
      availability: "24/7 response within 24 hours"
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Office Location",
      description: "Visit us in Accra",
      details: "10A Mega Street, Adenta Municipality, Accra, Ghana",
      availability: "Mon-Fri: 9AM-5PM GMT"
    }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Header currentPath="/faq" />

      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #a67c00 0%, #746354 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Find answers to common questions about Ardent Invoicing. 
              Can't find what you're looking for? Contact our support team.
            </Typography>
            <Button 
              component={Link} 
              href="/contact" 
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                px: 4,
                py: 1.5,
                '&:hover': { 
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                },
                transition: 'all 0.3s ease'
              }}
            >
              Contact Support
            </Button>
          </Box>
        </Container>
      </Box>

      {/* FAQ Categories */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          {faqCategories.map((category, categoryIndex) => (
            <Box key={categoryIndex} sx={{ mb: 8 }}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Box sx={{ mb: 2 }}>
                  {category.icon}
                </Box>
                <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                  {category.title}
                </Typography>
                <Divider sx={{ maxWidth: 200, mx: 'auto' }} />
              </Box>

              <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {category.questions.map((faq, faqIndex) => (
                  <Accordion 
                    key={faqIndex}
                    elevation={2}
                    sx={{ 
                      mb: 2,
                      borderRadius: 2,
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': {
                        margin: '0 0 16px 0'
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        '&.Mui-expanded': {
                          minHeight: 'auto'
                        },
                        '& .MuiAccordionSummary-content': {
                          margin: '16px 0'
                        },
                        borderRadius: 2
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                          pr: 2
                        }}
                      >
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Box>
          ))}
        </Container>
      </Box>

      {/* Contact Support Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Still Have Questions?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Our support team is here to help. Get in touch with us through any of these channels.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {contactInfo.map((contact, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {contact.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {contact.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {contact.description}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {contact.details}
                    </Typography>
                    <Chip 
                      label={contact.availability}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #a67c00 0%, #746354 100%)',
          color: 'white',
          py: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of Ghanaian businesses already using Ardent Invoicing
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button 
                component={Link} 
                href="/sme/signup" 
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Free Trial
              </Button>
              <Button 
                component={Link} 
                href="/contact" 
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                Contact Sales
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
