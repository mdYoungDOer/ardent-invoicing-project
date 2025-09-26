'use client';

import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from 'next-themes';
import { lightTheme, darkTheme } from '@/lib/theme';

export function MUIProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme();
  
  // Use resolvedTheme to get the actual theme (handles system theme)
  const currentTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <MUIThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
