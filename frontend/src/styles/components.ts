// frontend/src/styles/components.ts - Reusable component style configurations
import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import { customPalette } from './colors';


export const commonStyles = {
  // Card styles
  card: {
    default: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.04)',
      border: '1px solid #f1f5f9',
      borderRadius: 1,
      background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
    } as SxProps<Theme>,

    elevated: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.06)',
      border: '1px solid #f1f5f9',
      borderRadius: 2.5,
      background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
    } as SxProps<Theme>,
  },

  // Button styles
  button: {
    icon: {
      border: '1px solid',
      borderColor: 'grey.300',
      borderRadius: 2,
      '&:hover': {
        borderColor: 'primary.main',
        bgcolor: 'primary.50',
      },
    } as SxProps<Theme>,

    iconActive: {
      border: '1px solid',
      borderColor: 'primary.main',
      bgcolor: 'primary.50',
      borderRadius: 2,
      '&:hover': {
        bgcolor: 'primary.100',
      },
    } as SxProps<Theme>,

    text: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      borderRadius: 2,
    } as SxProps<Theme>,
  },

  // Stat cards
  statCard: {
    base: {
      p: 2.5,
      borderRadius: 1.5,
      border: '2px solid',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as SxProps<Theme>,

    success: {
      borderColor: 'success.light',
      bgcolor: 'success.50',
    } as SxProps<Theme>,

    error: {
      borderColor: 'error.light',
      bgcolor: 'error.50',
    } as SxProps<Theme>,

    info: {
      borderColor: 'info.light',
      bgcolor: 'info.50',
    } as SxProps<Theme>,
  },

  // List items
  listItem: {
    default: {
      py: 2.5,
      px: 1,
      flexDirection: 'column',
      alignItems: 'stretch',
      '&:hover': {
        bgcolor: 'action.hover',
        borderRadius: 1,
      },
    } as SxProps<Theme>,

    compact: {
      py: 1.5,
      px: 1,
      '&:hover': {
        bgcolor: 'action.hover',
        borderRadius: 1,
      },
    } as SxProps<Theme>,
  },

  // Typography presets
  typography: {
    sectionTitle: {
      fontWeight: 600,
      color: 'text.primary',
      mb: 2,
    } as SxProps<Theme>,

    cardTitle: {
      fontWeight: 600,
      color: 'text.primary',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    } as SxProps<Theme>,

    label: {
      fontWeight: 500,
      color: 'text.secondary',
      fontSize: '0.875rem',
    } as SxProps<Theme>,

    valuePositive: {
      fontWeight: 700,
      color: 'success.main',
      letterSpacing: '-0.02em',
    } as SxProps<Theme>,

    valueNegative: {
      fontWeight: 700,
      color: 'error.main',
      letterSpacing: '-0.02em',
    } as SxProps<Theme>,

    valueNeutral: {
      fontWeight: 600,
      color: 'text.primary',
      letterSpacing: '-0.02em',
    } as SxProps<Theme>,
  },

  // Dialogs
  dialog: {
    title: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid',
      borderColor: 'grey.200',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    } as SxProps<Theme>,

    content: {
      backgroundColor: '#ffffff',
      pt: 3,
    } as SxProps<Theme>,

    actions: {
      backgroundColor: '#ffffff',
      borderTop: '1px solid',
      borderColor: 'grey.200',
      px: 3,
      py: 2,
    } as SxProps<Theme>,
  },

  // Form controls
  form: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
    } as SxProps<Theme>,

    row: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
      gap: 2,
    } as SxProps<Theme>,

    threeColumn: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
      gap: 2,
    } as SxProps<Theme>,
  },

  // Chips
  chip: {
    default: {
      borderRadius: 2,
      fontWeight: 500,
      fontSize: '0.8125rem',
      letterSpacing: '-0.005em',
    } as SxProps<Theme>,

    category: {
      maxWidth: '151px',
      '& .MuiChip-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    } as SxProps<Theme>,

    filter: {
      borderRadius: 2,
      '& .MuiChip-icon': {
        fontSize: '1.0rem',
        marginLeft: 1,
        marginRight: -0.5,
      },
    } as SxProps<Theme>,
  },

  // Empty states
  emptyState: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      py: 10,
      px: 3,
    } as SxProps<Theme>,

    icon: {
      fontSize: 64,
      color: 'grey.300',
      mb: 2,
    } as SxProps<Theme>,

    title: {
      color: 'text.secondary',
      fontWeight: 500,
      mb: 0.5,
    } as SxProps<Theme>,

    description: {
      color: 'text.secondary',
      fontSize: '0.875rem',
    } as SxProps<Theme>,
  },

  // Progress indicators
  progress: {
    bar: {
      height: 8,
      borderRadius: 4,
      bgcolor: 'grey.200',
      '& .MuiLinearProgress-bar': {
        borderRadius: 4,
      },
    } as SystemStyleObject<Theme>,
  },

  // Containers
  container: {
    page: {
      mt: { xs: 2, md: 3 },
      mb: 2.5,
      px: { xs: 2, sm: 3 },
    } as SxProps<Theme>,

    section: {
      mb: 3,
    } as SxProps<Theme>,
  },

  // Spacing utilities
  spacing: {
    sectionGap: { xs: 2, md: 3 },
    itemGap: 2,
    compactGap: 1,
  },

  // Borders
  border: {
    light: `1px solid ${customPalette.slate[200]}`,
    default: `1px solid ${customPalette.slate[300]}`,
    divider: `1px solid ${customPalette.slate[100]}`,
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },

  // Transitions
  transition: {
    fast: 'all 150ms ease-in-out',
    default: 'all 250ms ease-in-out',
    slow: 'all 350ms ease-in-out',
  },
};


// Helper function to combine styles
export const combineStyles = (...styles: SxProps<Theme>[]): SxProps<Theme> => {
  return styles.reduce((acc, style) => ({ ...acc, ...style }), {});
};


// Utility function for conditional styles
export const conditionalStyle = (
  condition: boolean,
  trueStyle: SxProps<Theme>,
  falseStyle?: SxProps<Theme>
): SxProps<Theme> => {
  return condition ? trueStyle : (falseStyle || {});
};
