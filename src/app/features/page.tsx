'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import Link from 'next/link';

export default function Features() {
  const { theme: nextTheme, setTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const features = [
    {
      icon: <ReceiptIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Professional Invoicing',
      description: 'Create beautiful, professional invoices in minutes with our intuitive interface.',
      features: [
        'Customizable invoice templates',
        'Automated invoice numbering',
        'Multiple currency support (GHS default)',
        'PDF generation and email delivery',
        'Payment status tracking'
      ]
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Expense Management',
      description: 'Track and categorize business expenses with detailed reporting capabilities.',
      features: [
        'Receipt photo capture',
        'Expense categorization',
        'Automated expense reports',
        'Tax-deductible tracking',
        'Export to accounting software'
      ]
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Security & Compliance',
      description: 'Bank-level security with full compliance to Ghanaian tax regulations.',
      features: [
        'End-to-end encryption',
        'GDPR compliance',
        'Ghanaian tax regulation compliance',
        'Regular security audits',
        'Data backup and recovery'
      ]
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Mobile-First Design',
      description: 'Access your business data anywhere, anytime with our responsive mobile app.',
      features: [
        'iOS and Android apps',
        'Offline functionality',
        'Real-time synchronization',
        'Touch-optimized interface',
        'Push notifications'
      ]
    }
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton component={Link} href="/" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Ardent Invoicing
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} href="/" sx={{ color: 'text.primary' }}>
              Home
            </Button>
            <Button color="inherit" component={Link} href="/pricing" sx={{ color: 'text.primary' }}>
              Pricing
            </Button>
            <Button color="inherit" component={Link} href="/about" sx={{ color: 'text.primary' }}>
              About
            </Button>
            <Button variant="outlined" component={Link} href="/login" sx={{ color: 'primary.main', borderColor: 'primary.main' }}>
              Login
            </Button>
            <Button variant="contained" component={Link} href="/signup" sx={{ bgcolor: 'primary.main' }}>
              Get Started
            </Button>
            <IconButton onClick={toggleTheme} color="inherit">
              {nextTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                color: 'text.primary',
                mb: 3,
                lineHeight: 1.2
              }}
            >
              Powerful Features for{' '}
              <Typography
                component="span"
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a67c00 0%, #746354 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Ghanaian SMEs
              </Typography>
            </Typography>
            <Typography
              variant="h5"
              component="p"
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.6,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Everything you need to manage your business finances, from invoicing to expense tracking, 
              designed specifically for the Ghanaian market.
            </Typography>
          </Box>

          {/* Features Grid */}
          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                      {feature.description}
                    </Typography>
                    <List>
                      {feature.features.map((item, itemIndex) => (
                        <ListItem key={itemIndex} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckIcon sx={{ color: 'success.main' }} />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                Ardent Invoicing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Empowering Ghanaian SMEs with professional invoicing and expense management solutions.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 4 }}>
                <Button color="inherit" component={Link} href="/" sx={{ color: 'text.primary' }}>
                  Home
                </Button>
                <Button color="inherit" component={Link} href="/pricing" sx={{ color: 'text.primary' }}>
                  Pricing
                </Button>
                <Button color="inherit" component={Link} href="/about" sx={{ color: 'text.primary' }}>
                  About
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Ardent Invoicing. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
