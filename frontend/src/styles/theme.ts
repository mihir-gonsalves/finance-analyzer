// frontend/src/styles/theme.ts - MUI theme configuration (colors, typography, spacing)
import { createTheme } from "@mui/material/styles";
import { customPalette } from './colors';
import { typography } from "./typography";

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
    success: customPalette.success,
    error: customPalette.error,
    grey: customPalette.slate,
  },

  typography,

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
          letterSpacing: '-0.005em',
          textTransform: 'none',
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
      defaultProps: {
        size: 'small',
        color: 'primary',
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          letterSpacing: '-0.005em',
          '& .MuiChip-icon': {
            fontSize: '1.0rem',
            marginLeft: 6,
            marginRight: -3,
          },
        },
        outlined: {
          borderColor: '#059669'
        }
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff'
        }
      }
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff'
        }
      }
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          paddingRight: '1.5rem',
          paddingBottom: '1.5rem',
        }
      }
    },

    // Standard MUI Tooltip (used in DataGrid, buttons, etc.) - not used in charts
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: customPalette.slate[800],
          color: '#ffffff',
          fontSize: '0.8125rem',
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: 8,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        arrow: {
          color: customPalette.slate[800],
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
        },
        listbox: {
          backgroundColor: '#ffffff',
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
        },
      },
    },

    // dropdowns
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});
