import { createTheme } from "@mui/material/styles";
import { customPalette } from './colors';
import { typography } from "./typography";
// import { chartStyles } from "./charts";

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: customPalette.emerald,
    secondary: customPalette.amber,
    background: {
      default: customPalette.slate[50],
      paper: customPalette.slate[100],
    },
    text: {
      primary: customPalette.slate[800],
      secondary: customPalette.slate[500],
      disabled: customPalette.slate[400],
    },
    success: customPalette.green,
    error: customPalette.red,
    grey: customPalette.slate,
  },

  typography,

  shape: {
    borderRadius: 12, // Increased for modern look
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          letterSpacing: '-0.005em',
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});
