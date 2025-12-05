// frontend/src/styles/index.ts - Central export for all styles

// Export all constants
export * from './constants';

// Export color palette
export * from './colors';

// Export typography
export * from './typography';

// Export theme
export * from './theme';

// Export chart styles
export * from './charts';

// Export component styles
export * from './components';

// Export layout styles
export * from './layouts';

// Re-export commonly used items for convenience
export { customPalette } from './colors';
export { typography } from './typography';
export { theme } from './theme';
export { chartStyles } from './charts';
export {
  commonStyles,
  combineStyles,
  conditionalStyle,
  cardStyles,
  buttonStyles,
  typographyStyles,
  dialogStyles,
  formStyles,
  chipStyles,
} from './components';
export { layoutStyles } from './layouts';
export {
  HEIGHTS,
  SPACING,
  TRANSITIONS,
  Z_INDEX,
  BREAKPOINTS,
  BORDER_RADIUS,
  FONT_WEIGHT,
} from './constants';
