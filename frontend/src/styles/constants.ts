// frontend/src/styles/constants.ts - centralized dimensions and magic numbers

/**
 * Component Heights
 * Defines standardized heights for consistent layouts
 */
export const HEIGHTS = {
  // Main content areas
  dataGrid: 570,
  chartContainer: 561,
  analyticsPanel: 658,
  
  // Chart components
  timelineChart: 410,
  barChart: 410,
  pieChartWrapper: 389,
  
  // Scrollable lists
  categoryList: 570,
} as const;

/**
 * Spacing Scale
 * Consistent spacing multipliers (multiply by 8px base)
 */
export const SPACING = {
  xs: 0.5,   // 4px
  sm: 1,     // 8px
  md: 2,     // 16px
  lg: 3,     // 24px
  xl: 4,     // 32px
  xxl: 6,    // 48px
} as const;

/**
 * Animation Durations
 * Consistent timing for transitions
 */
export const TRANSITIONS = {
  fast: 150,
  normal: 250,
  slow: 350,
  pageLoad: 600,
} as const;

/**
 * Z-Index Layers
 * Prevents z-index conflicts
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  tooltip: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
} as const;

/**
 * Breakpoints (pixels)
 * Matches MUI breakpoint system
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

/**
 * Border Radius Scale
 */
export const BORDER_RADIUS = {
  sm: 1,     // 8px
  md: 1.5,   // 12px
  lg: 2,     // 16px
  xl: 2.5,   // 20px
} as const;

/**
 * Typography Weights
 */
export const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;