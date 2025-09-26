'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Button
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';
import Link from 'next/link';

export default function About() {
  const { theme: nextTheme, setTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(nextTheme === 'dark' ? 'light' : 'dark');
  };

  const team = [
    {
      name: 'Kwame Asante',
      role: 'Founder & CEO',
      bio: 'Former accountant with 10+ years experience in Ghanaian SME finance and tax compliance.',
      avatar: 'KA'
    },
    {
      name: 'Ama Serwaa',
      role: 'CTO',
      bio: 'Full-stack developer passionate about building solutions for African businesses.',
      avatar: 'AS'
    },
    {
      name: 'Kofi Mensah',
      role: 'Head of Product',
      bio: 'Product manager with deep understanding of SME challenges in Ghana.',
      avatar: 'KM'
    }
  ];

  const values = [
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'SME-First Approach',
      description: 'We build features that matter most to Ghanaian small and medium enterprises.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Growth-Oriented',
      description: 'Our platform scales with your business, from startup to enterprise.'
    },
    {
      icon: <PublicIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Local Expertise',
      description: 'Built by Ghanaians, for Ghanaians, with deep understanding of local business needs.'
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
            <Button color="inherit" component={Link} href="/features" sx={{ color: 'text.primary' }}>
              Features
            </Button>
            <Button color="inherit" component={Link} href="/pricing" sx={{ color: 'text.primary' }}>
              Pricing
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
              About{' '}
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
                Ardent Invoicing
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
              Empowering Ghanaian SMEs with professional invoicing and expense management solutions.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Our Mission
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                At Ardent Invoicing, we believe that every Ghanaian SME deserves access to professional-grade 
                financial management tools. We're on a mission to simplify invoicing and expense tracking, 
                helping businesses focus on what they do best – growing their operations.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Founded in 2024 by a team of Ghanaian entrepreneurs and developers, we understand the unique 
                challenges faced by SMEs in Ghana. From tax compliance to multi-currency transactions, 
                we've built our platform with these local needs in mind.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: { xs: 300, md: 400 },
                  bgcolor: 'rgba(166, 124, 0, 0.1)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Mission Image Coming Soon
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Our Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 3 }}>
                      {value.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Meet Our Team
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        mx: 'auto',
                        mb: 3,
                        fontSize: '1.5rem',
                        fontWeight: 600
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.bio}
                    </Typography>
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
          background: 'linear-gradient(135deg, #746354 0%, #9a8577 100%)',
          py: { xs: 8, md: 12 },
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: 'white'
              }}
            >
              Ready to Join Us?
            </Typography>
            <Typography
              variant="h6"
              component="p"
              sx={{
                mb: 4,
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              Start your journey with Ardent Invoicing today and experience the difference 
              professional financial management can make.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/signup"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
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
                <Button color="inherit" component={Link} href="/features" sx={{ color: 'text.primary' }}>
                  Features
                </Button>
                <Button color="inherit" component={Link} href="/pricing" sx={{ color: 'text.primary' }}>
                  Pricing
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
