'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Stack,
  Divider,
  IconButton,
  Link as MuiLink
} from '@mui/material';
import { Grid } from '@mui/material';
import { 
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  WhatsApp as WhatsAppIcon
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
    { icon: <LinkedInIcon />, href: "https://linkedin.com/company/ardentinvoicing", label: "LinkedIn" },
    { icon: <Box component="svg" sx={{ width: 24, height: 24, fill: 'currentColor' }} viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </Box>, href: "https://x.com/ardentinvoicing", label: "X (Twitter)" },
    { icon: <FacebookIcon />, href: "https://facebook.com/ardentinvoicing", label: "Facebook" },
    { icon: <YouTubeIcon />, href: "https://youtube.com/@ardentinvoicing", label: "YouTube" },
    { icon: <Box component="svg" sx={{ width: 24, height: 24, fill: 'currentColor' }} viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.1 2.19-.66 2.71-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </Box>, href: "https://tiktok.com/@ardentinvoicing", label: "TikTok" },
    { icon: <WhatsAppIcon />, href: "https://wa.me/233548327906", label: "WhatsApp" }
  ];

  return (
    <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Company Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Image 
                  src="/logo.png" 
                  alt="Ardent Invoicing" 
                  width={112} 
                  height={64}
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    transition: 'transform 0.3s ease'
                  }}
                />
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
            <Grid size={{ xs: 12, sm: 6, md: 2 }} key={index}>
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
              justifyContent: 'space-between',
              gap: 3,
              width: '100%'
            }}>
              {/* Copyright */}
              <Box sx={{ 
                textAlign: { xs: 'center', md: 'left' },
                flex: 1,
                minWidth: 0
              }}>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                  © {currentYear} Ardent Invoicing. All rights reserved. Powered by <a href="tel:+233548327906" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Mega Web Services</a>
                </Typography>
              </Box>

              {/* Social Links */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flexShrink: 0,
                justifyContent: { xs: 'center', md: 'flex-end' }
              }}>
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
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'rgba(166, 124, 0, 0.1)',
                        transform: 'translateY(-2px)'
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
