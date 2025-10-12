// styles/charts.ts

import { customPalette } from './colors';

export const chartStyles = {
  container: {
    width: '100%',
    height: 420,
    borderRadius: 2,
    overflow: 'hidden',
  },
  margins: {
    top: 20,
    right: 40,
    left: 30,
    bottom: 20,
  },
  colors: {
    primary: customPalette.emerald.main,
    primaryLight: customPalette.emerald.light,
    accent: customPalette.amber.main,
    gridStroke: customPalette.slate[200],
    textPrimary: customPalette.slate[800],
    textSecondary: customPalette.slate[500],
    background: '#fefefe',
  },
  gradientStops: [
    { offset: '0%', stopColor: customPalette.emerald.main, stopOpacity: 0.2 },
    { offset: '30%', stopColor: customPalette.emerald.light, stopOpacity: 0.1 },
    { offset: '70%', stopColor: '#34d399', stopOpacity: 0.05 },
    { offset: '100%', stopColor: '#6ee7b7', stopOpacity: 0 },
  ],
  strokeWidth: 3,
  gridOpacity: 0.4,
  activeDot: {
    r: 6,
    strokeWidth: 3,
    dropShadow: 'drop-shadow(0px 3px 8px rgba(5, 150, 105, 0.25))',
  },
  tooltip: {
    minWidth: 220,
    padding: 2.5,
    borderRadius: 2,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
    border: `1px solid ${customPalette.slate[100]}`,
    background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
  },
  emptyState: {
    textAlign: 'center' as const,
    py: 10,
    color: customPalette.slate[500],
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: 4,
    pb: 2,
    borderBottom: `1px solid ${customPalette.slate[100]}`,
  },
  balanceDisplay: {
    textAlign: 'right' as const,
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: 1,
    padding: 2,
    border: `1px solid ${customPalette.slate[200]}`,
  },
  footer: {
    mt: 3,
    pt: 2,
    borderTop: `1px solid ${customPalette.slate[100]}`,
    background: '#fafafa',
    borderRadius: 2,
    padding: 2,
    marginX: -2,
  },
};
