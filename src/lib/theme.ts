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
    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.02em',
    },
    overline: {
      fontWeight: 600,
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
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
          borderRadius: 12,
          padding: '12px 32px',
          fontSize: '0.875rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: '0 4px 16px rgba(166, 124, 0, 0.25)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(166, 124, 0, 0.35)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(166, 124, 0, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#a67c00',
              borderWidth: '2px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#a67c00',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
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
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#d4a853',
              borderWidth: '2px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#d4a853',
              borderWidth: '2px',
            },
          },
        },
      },
    },
  },
});
