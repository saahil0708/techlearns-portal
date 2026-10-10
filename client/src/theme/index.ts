import { createTheme } from '@mui/material/styles';
import { BRAND_COLORS } from './colors';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: BRAND_COLORS.primary,
      light: BRAND_COLORS.navy[700],
      dark: BRAND_COLORS.navy.active,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: BRAND_COLORS.secondary,
      light: BRAND_COLORS.purple[500],
      dark: BRAND_COLORS.purple[900],
      contrastText: '#FFFFFF',
    },
    info: {
      main: BRAND_COLORS.navy[600],
    },
    background: {
      default: '#F4F5F7',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: "var(--font-gt-flexa), 'GT Flexa Lt', 'GT Flexa', 'Plus Jakarta Sans', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
  },
});

export * from './colors';
