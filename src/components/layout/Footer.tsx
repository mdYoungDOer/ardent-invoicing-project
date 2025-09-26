'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  Stack,
  Divider,
  IconButton,
  Link as MuiLink
} from '@mui/material';
import { 
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Security", href: "/security" },
        { label: "Integrations", href: "/integrations" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "FAQ", href: "/faq" },
        { label: "Documentation", href: "/docs" },
        { label: "Status", href: "/status" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "GDPR", href: "/gdpr" }
      ]
    }
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, href: "https://facebook.com/ardentinvoicing", label: "Facebook" },
    { icon: <TwitterIcon />, href: "https://twitter.com/ardentinvoicing", label: "Twitter" },
    { icon: <LinkedInIcon />, href: "https://linkedin.com/company/ardentinvoicing", label: "LinkedIn" },
    { icon: <InstagramIcon />, href: "https://instagram.com/ardentinvoicing", label: "Instagram" }
  ];

  return (
    <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Image 
                  src="/logo.png" 
                  alt="Ardent Invoicing" 
                  width={40} 
                  height={40}
                  style={{ marginRight: 12 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Ardent Invoicing
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
                Empowering Ghanaian SMEs with professional invoicing and expense management solutions. 
                Built for the local market with GHS support and Ghana tax compliance.
              </Typography>
              
              {/* Contact Info */}
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2">+233 54 832 7906</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2">hello@ardentinvoicing.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2">10A Mega Street, Adenta Municipality, Accra, Ghana</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Navigation Links */}
          {footerSections.map((section, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'white' }}>
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link, linkIndex) => (
                  <Link 
                    key={linkIndex}
                    href={link.href} 
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#a67c00'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                  >
                    <Typography variant="body2">{link.label}</Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 6, bgcolor: 'grey.700' }} />

        {/* Bottom Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { xs: 'center', md: 'space-between' },
          gap: 3
        }}>
          {/* Copyright */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              © {currentYear} Ardent Invoicing. All rights reserved.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              Powered by <a href="tel:+233548327906" target="_blank" rel="noopener noreferrer">Mega Web Services</a>
            </Typography>
          </Box>

          {/* Social Links */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {socialLinks.map((social, index) => (
              <IconButton
                key={index}
                component="a"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'rgba(166, 124, 0, 0.1)'
                  }
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>
        </Box>

        {/* Additional Info */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            Ardent Invoicing is a registered trademark. All product names, logos, and brands are property of their respective owners.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
