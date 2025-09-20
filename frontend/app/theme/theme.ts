'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5A5F', // Airbnb coral/pink
      light: '#FF8E93',
      dark: '#E00007',
    },
    secondary: {
      main: '#00A699', // Airbnb teal
      light: '#4ECDC4',
      dark: '#008489',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F7F7F7',
    },
    text: {
      primary: '#484848', // Airbnb dark gray
      secondary: '#767676', // Airbnb medium gray
    },
    divider: '#EBEBEB',
  },
  typography: {
    fontFamily: 'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", "Circular", "Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      color: '#484848',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#484848',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#484848',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#484848',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#484848',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      color: '#767676',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;