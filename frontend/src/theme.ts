import { createTheme } from "@mui/material/styles";

// Custom color palette inspired by modern fintech apps
const customPalette = {
  // Primary: Deep teal/emerald (instead of Google blue)
  primary: {
    main: '#059669',
    light: '#10b981',
    dark: '#047857',
  },
  // Secondary: Warm orange accent
  secondary: {
    main: '#f59e0b', 
    light: '#fbbf24',
    dark: '#d97706', 
  },
  // Background: Modern dark mode inspired but light
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#f8fafc',
  },
  // Text colors with better contrast
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8',
  },
  // Financial colors
  success: {   // for positive amounts
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
  },
  error: {  // for negative amounts
    main: '#ef4444',
    light: '#f87171', 
    dark: '#dc2626', 
  },
  // Neutral greys
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    ...customPalette,
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      letterSpacing: '-0.01em',
    },
    body2: {
      letterSpacing: '-0.005em',
    },
  },
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

// Chart-specific styling constants with custom theme
export const chartStyles = {
  container: {
    width: '100%', 
    height: 420, // Slightly taller
    borderRadius: 2,
    overflow: 'hidden',
  },
  margins: { 
    top: 20, 
    right: 40, 
    left: 30, 
    bottom: 20 
  },
  colors: {
    primary: '#059669', // emerald-600
    primaryLight: '#10b981', // emerald-500
    accent: '#f59e0b', // amber-500
    gridStroke: '#e2e8f0', // slate-200
    textPrimary: '#1e293b', // slate-800
    textSecondary: '#64748b', // slate-500
    background: '#fefefe',
  },
  gradientStops: [
    { offset: '0%', stopColor: '#059669', stopOpacity: 0.2 },
    { offset: '30%', stopColor: '#10b981', stopOpacity: 0.1 },
    { offset: '70%', stopColor: '#34d399', stopOpacity: 0.05 },
    { offset: '100%', stopColor: '#6ee7b7', stopOpacity: 0 },
  ],
  strokeWidth: 3,
  gridOpacity: 0.4,
  activeDot: {
    r: 6,
    strokeWidth: 3,
    dropShadow: 'drop-shadow(0px 3px 8px rgba(5, 150, 105, 0.25))'
  },
  tooltip: {
    minWidth: 220,
    padding: 2.5,
    borderRadius: 2,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
  },
  emptyState: {
    textAlign: 'center' as const,
    py: 10,
    color: '#64748b',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: 4,
    pb: 2,
    borderBottom: '1px solid #f1f5f9',
  },
  balanceDisplay: {
    textAlign: 'right' as const,
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: 1,
    padding: 2,
    border: '1px solid #e2e8f0',
  },
  footer: {
    mt: 3,
    pt: 2,
    borderTop: '1px solid #f1f5f9',
    background: '#fafafa',
    borderRadius: 2,
    padding: 2,
    marginX: -2,
  },
};