// frontend/src/styles/components.ts - Reusable component style configurations
import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import { customPalette } from './colors';
import { SPACING, BORDER_RADIUS, FONT_WEIGHT } from './constants';

/**
 * Card Styles
 */
export const cardStyles = {
  default: {
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.04)',
    border: '1px solid #f1f5f9',
    borderRadius: BORDER_RADIUS.sm,
    background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
  } as SxProps<Theme>,

  elevated: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9',
    borderRadius: BORDER_RADIUS.xl,
    background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
  } as SxProps<Theme>,
};

/**
 * Button Styles
 */
export const buttonStyles = {
  icon: {
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: BORDER_RADIUS.lg,
    '&:hover': {
      borderColor: 'primary.main',
      bgcolor: 'primary.50',
    },
  } as SxProps<Theme>,

  iconActive: {
    border: '1px solid',
    borderColor: 'primary.main',
    bgcolor: 'primary.50',
    borderRadius: BORDER_RADIUS.lg,
    '&:hover': {
      bgcolor: 'primary.100',
    },
  } as SxProps<Theme>,

  text: {
    textTransform: 'none',
    fontWeight: FONT_WEIGHT.medium,
    letterSpacing: '-0.01em',
    borderRadius: BORDER_RADIUS.lg,
  } as SxProps<Theme>,
};

/**
 * Stat Card Styles
 */
export const statCardStyles = {
  base: {
    p: 2.5,
    borderRadius: BORDER_RADIUS.md,
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
};

/**
 * List Item Styles
 */
export const listItemStyles = {
  default: {
    py: 2.5,
    px: SPACING.sm,
    flexDirection: 'column',
    alignItems: 'stretch',
    '&:hover': {
      bgcolor: 'action.hover',
      borderRadius: BORDER_RADIUS.sm,
    },
  } as SxProps<Theme>,

  compact: {
    py: 1.5,
    px: SPACING.sm,
    '&:hover': {
      bgcolor: 'action.hover',
      borderRadius: BORDER_RADIUS.sm,
    },
  } as SxProps<Theme>,
};

/**
 * Typography Presets
 */
export const typographyStyles = {
  sectionTitle: {
    fontWeight: FONT_WEIGHT.semibold,
    color: 'text.primary',
    mb: SPACING.md,
  } as SxProps<Theme>,

  cardTitle: {
    fontWeight: FONT_WEIGHT.semibold,
    color: 'text.primary',
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
  } as SxProps<Theme>,

  label: {
    fontWeight: FONT_WEIGHT.medium,
    color: 'text.secondary',
    fontSize: '0.875rem',
  } as SxProps<Theme>,

  valuePositive: {
    fontWeight: FONT_WEIGHT.bold,
    color: 'success.main',
    letterSpacing: '-0.02em',
  } as SxProps<Theme>,

  valueNegative: {
    fontWeight: FONT_WEIGHT.bold,
    color: 'error.main',
    letterSpacing: '-0.02em',
  } as SxProps<Theme>,

  valueNeutral: {
    fontWeight: FONT_WEIGHT.semibold,
    color: 'text.primary',
    letterSpacing: '-0.02em',
  } as SxProps<Theme>,
};

/**
 * Dialog Styles
 */
export const dialogStyles = {
  title: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid',
    borderColor: 'grey.200',
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
  } as SxProps<Theme>,

  content: {
    backgroundColor: '#ffffff',
    pt: SPACING.lg,
  } as SxProps<Theme>,

  actions: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid',
    borderColor: 'grey.200',
    px: SPACING.lg,
    py: SPACING.md,
  } as SxProps<Theme>,
};

/**
 * Form Control Styles
 */
export const formStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
  } as SxProps<Theme>,

  row: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: SPACING.md,
  } as SxProps<Theme>,

  threeColumn: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
    gap: SPACING.md,
  } as SxProps<Theme>,
};

/**
 * Chip Styles
 */
export const chipStyles = {
  default: {
    borderRadius: BORDER_RADIUS.lg,
    fontWeight: FONT_WEIGHT.medium,
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
    borderRadius: BORDER_RADIUS.lg,
    '& .MuiChip-icon': {
      fontSize: '1.0rem',
      marginLeft: SPACING.sm,
      marginRight: -0.5,
    },
  } as SxProps<Theme>,
};

/**
 * Empty State Styles
 */
export const emptyStateStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    py: 10,
    px: SPACING.lg,
  } as SxProps<Theme>,

  icon: {
    fontSize: 64,
    color: 'grey.300',
    mb: SPACING.md,
  } as SxProps<Theme>,

  title: {
    color: 'text.secondary',
    fontWeight: FONT_WEIGHT.medium,
    mb: 0.5,
  } as SxProps<Theme>,

  description: {
    color: 'text.secondary',
    fontSize: '0.875rem',
  } as SxProps<Theme>,
};

/**
 * Progress Indicator Styles
 */
export const progressStyles = {
  bar: {
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
    bgcolor: 'grey.200',
    '& .MuiLinearProgress-bar': {
      borderRadius: BORDER_RADIUS.sm,
    },
  } as SystemStyleObject<Theme>,
};

/**
 * Container Styles
 */
export const containerStyles = {
  page: {
    mt: { xs: SPACING.md, md: SPACING.lg },
    mb: 2.5,
    px: { xs: SPACING.md, sm: SPACING.lg },
  } as SxProps<Theme>,

  section: {
    mb: SPACING.lg,
  } as SxProps<Theme>,
};

/**
 * Border Utilities
 */
export const borders = {
  light: `1px solid ${customPalette.slate[200]}`,
  default: `1px solid ${customPalette.slate[300]}`,
  divider: `1px solid ${customPalette.slate[100]}`,
};

/**
 * Shadow Utilities
 */
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
};

/**
 * Transition Utilities
 */
export const transitions = {
  fast: 'all 150ms ease-in-out',
  default: 'all 250ms ease-in-out',
  slow: 'all 350ms ease-in-out',
};

/**
 * Helper: Combine multiple style objects
 */
export const combineStyles = (...styles: SxProps<Theme>[]): SxProps<Theme> => {
  return styles.reduce((acc, style) => ({ ...acc, ...style }), {});
};

/**
 * Helper: Conditional style application
 */
export const conditionalStyle = (
  condition: boolean,
  trueStyle: SxProps<Theme>,
  falseStyle?: SxProps<Theme>
): SxProps<Theme> => {
  return condition ? trueStyle : (falseStyle || {});
};

/**
 * Export consolidated styles object for backward compatibility
 */
export const commonStyles = {
  card: cardStyles,
  button: buttonStyles,
  statCard: statCardStyles,
  listItem: listItemStyles,
  typography: typographyStyles,
  dialog: dialogStyles,
  form: formStyles,
  chip: chipStyles,
  emptyState: emptyStateStyles,
  progress: progressStyles,
  container: containerStyles,
  border: borders,
  shadow: shadows,
  transition: transitions,
};
