// frontend/src/styles/charts.ts - Chart configurations and styles
import type { SxProps, Theme } from '@mui/material';
import type { DeepPartial, ChartOptions, BaselineSeriesPartialOptions } from 'lightweight-charts';
import { HEIGHTS, SPACING, BORDER_RADIUS, Z_INDEX } from './constants';
import { customPalette } from './colors';

/**
 * Chart Container Styles
 */
const containerStyles = {
  wrapper: {
    position: 'relative',
    height: HEIGHTS.timelineWrapper,
    mb: SPACING.xl,
  } as SxProps<Theme>,

  chart: {
    width: '100%',
    height: `${HEIGHTS.timelineChart}px`,
  } as React.CSSProperties,
};

/**
 * Chart Header Styles
 */
const headerStyles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: SPACING.md,
  } as SxProps<Theme>,

  title: {
    fontWeight: 600,
    color: 'text.primary',
  } as SxProps<Theme>,

  balanceDisplay: {
    textAlign: 'right',
  } as SxProps<Theme>,

  balanceLabel: {
    color: 'text.secondary',
    fontSize: '0.875rem',
    mb: 0.5,
  } as SxProps<Theme>,

  balanceAmount: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
  } as SxProps<Theme>,
};

/**
 * Chart Footer Styles
 */
const footerStyles = {
  container: {
    borderTop: '1px solid',
    borderColor: 'grey.200',
    background: 'grey.50',
    p: SPACING.md,
    mx: -2,
    mb: -3.45,
    mt: 4.35,
  } as SxProps<Theme>,

  text: {
    fontSize: '0.875rem',
  } as SxProps<Theme>,
};

/**
 * Custom Tooltip Styles (for Timeline/lightweight-charts)
 */
const tooltipStyles = {
  container: {
    position: 'absolute',
    display: 'none',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid',
    borderColor: 'grey.200',
    borderRadius: BORDER_RADIUS.lg,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    pointerEvents: 'none',
    zIndex: Z_INDEX.tooltip,
    minWidth: '220px',
    maxWidth: '280px',
  } as SxProps<Theme>,

  date: {
    fontWeight: 600,
    color: 'text.primary',
    fontSize: '0.875rem',
    mb: 0.5,
  } as SxProps<Theme>,

  description: {
    color: 'text.secondary',
    fontSize: '0.8rem',
    mb: SPACING.sm,
    wordWrap: 'break-word',
  } as SxProps<Theme>,

  transaction: {
    fontWeight: 500,
    fontSize: '0.8rem',
    mb: 0.5,
  } as SxProps<Theme>,

  balance: {
    fontWeight: 700,
    color: 'primary.main',
    fontSize: '0.9rem',
    mt: SPACING.sm,
    pt: SPACING.sm,
    borderTop: '1px solid',
    borderColor: 'grey.200',
  } as SxProps<Theme>,
};

/**
 * Lightweight Charts Configuration
 * Used by Timeline component
 */
const lightweightChartsConfig: DeepPartial<ChartOptions> = {
  layout: {
    background: { color: 'transparent' },
    textColor: customPalette.slate[500],
    fontSize: 12,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  grid: {
    vertLines: { color: 'rgba(203, 213, 225, 0.3)' },
    horzLines: { color: 'rgba(203, 213, 225, 0.3)' },
  },
  crosshair: {
    mode: 1,
    vertLine: {
      color: customPalette.emerald.main,
      width: 1,
      style: 3,
      labelBackgroundColor: customPalette.emerald.main,
    },
    horzLine: {
      color: customPalette.emerald.main,
      width: 1,
      style: 3,
      labelBackgroundColor: customPalette.emerald.main,
    },
  },
  timeScale: {
    borderColor: customPalette.slate[200],
    timeVisible: true,
    secondsVisible: false,
    fixLeftEdge: true,
    fixRightEdge: true,
  },
  rightPriceScale: {
    borderColor: customPalette.slate[200],
  },
  handleScale: {
    axisPressedMouseMove: {
      time: true,
      price: true,
    },
  },
  handleScroll: {
    vertTouchDrag: true,
  },
};

/**
 * Baseline Series Configuration
 * Used by Timeline component for area chart
 */
const baselineSeriesConfig: DeepPartial<BaselineSeriesPartialOptions> = {
  baseValue: { type: 'price', price: 0 },
  topLineColor: customPalette.emerald.light,
  topFillColor1: 'rgba(16, 185, 129, 0.28)',
  topFillColor2: 'rgba(16, 185, 129, 0.05)',
  bottomLineColor: customPalette.error.main,
  bottomFillColor1: 'rgba(239, 68, 68, 0.28)',
  bottomFillColor2: 'rgba(239, 68, 68, 0.05)',
  lineWidth: 1,
  priceFormat: {
    type: 'price',
    precision: 2,
    minMove: 0.01,
  },
};

/**
 * Export consolidated chart styles
 */
export const chartStyles = {
  // Component styles
  chartWrapper: containerStyles.wrapper,
  chartContainer: containerStyles.chart,
  
  // Header styles
  header: headerStyles.container,
  headerTitle: headerStyles.title,
  balanceDisplay: headerStyles.balanceDisplay,
  balanceLabel: headerStyles.balanceLabel,
  balanceAmount: headerStyles.balanceAmount,
  
  // Footer styles
  footer: footerStyles.container,
  footerText: footerStyles.text,
  
  // Tooltip styles
  tooltip: tooltipStyles.container,
  tooltipDate: tooltipStyles.date,
  tooltipDescription: tooltipStyles.description,
  tooltipTransaction: tooltipStyles.transaction,
  tooltipBalance: tooltipStyles.balance,
  
  // Chart configurations
  chartConfig: lightweightChartsConfig,
  seriesConfig: baselineSeriesConfig,
};
