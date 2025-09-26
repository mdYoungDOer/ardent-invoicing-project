import { createTheme } from '@mui/material/styles';

// Custom theme for Ardent Invoicing
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#a67c00',
      light: '#d4a853',
      dark: '#7a5a00',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#746354',
      light: '#9a8577',
      dark: '#4a3f36',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#fafafa',
    },
    text: {
      primary: '#2c2c2c',
      secondary: 'rgba(44, 44, 44, 0.6)',
    },
    divider: 'rgba(44, 44, 44, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(166, 124, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(166, 124, 0, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    // CRITICAL: Set container props for components that render outside DOM hierarchy
    MuiPopover: {
      defaultProps: {
        container: () => document.getElementById('__next'),
      },
    },
    MuiPopper: {
      defaultProps: {
        container: () => document.getElementById('__next'),
      },
    },
    MuiDialog: {
      defaultProps: {
        container: () => document.getElementById('__next'),
      },
    },
    MuiModal: {
      defaultProps: {
        container: () => document.getElementById('__next'),
      },
    },
    MuiDrawer: {
      defaultProps: {
        container: () => document.getElementById('__next'),
      },
    },
  },
});

export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#d4a853',
      light: '#e6c77a',
      dark: '#a67c00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#9a8577',
      light: '#b39b8f',
      dark: '#746354',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    ...lightTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
  },
});
