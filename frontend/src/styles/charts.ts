// frontend/src/styles/charts.ts
import { customPalette } from './colors';
import { ColorType, LineStyle } from 'lightweight-charts';


export const chartStyles = {
  colors: {
    primary: customPalette.emerald.main,
    primaryLight: customPalette.emerald.light,
    accent: customPalette.amber.main,
    gridStroke: customPalette.slate[200],
    textPrimary: customPalette.slate[800],
    textSecondary: customPalette.slate[500],
    background: '#fefefe',
  },

  // Chart configuration
  chartConfig: {
    height: 380,
    layout: {
      textColor: customPalette.slate[500],
      fontFamily: 'Inter, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 12,
      background: {
        type: ColorType.Solid,
        color: '#fefefe'
      },
    },
    grid: {
      vertLines: {
        color: customPalette.slate[200],
        style: LineStyle.Dashed,
        visible: true
      },
      horzLines: {
        color: customPalette.slate[200],
        style: LineStyle.Dashed,
        visible: true
      },
    },
    rightPriceScale: {
      borderColor: customPalette.slate[200],
    },
    timeScale: {
      borderColor: customPalette.slate[200],
    },
  },

  // Series configuration
  seriesConfig: {
    baseValue: { type: 'price' as const, price: 0 },
    topLineColor: customPalette.emerald.main,
    topFillColor1: 'rgba(16, 185, 129, 0.28)',
    topFillColor2: 'rgba(16, 185, 129, 0.05)',
    bottomLineColor: 'rgba(239, 83, 80, 1)',
    bottomFillColor1: 'rgba(239, 83, 80, 0.05)',
    bottomFillColor2: 'rgba(239, 83, 80, 0.28)',
    priceLineVisible: false,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 3,
    crosshairMarkerBorderColor: 'black',
    crosshairMarkerBackgroundColor: 'white',
  },

  // Component styles
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: 2,
  },

  headerTitle: {
    color: customPalette.slate[800],
    fontWeight: 600,
  },

  balanceDisplay: {
    textAlign: 'right' as const,
    background: '#ffffff',
    borderRadius: 1,
    padding: 2,
    border: `1px solid ${customPalette.slate[200]}`,
  },

  balanceLabel: {
    color: customPalette.slate[500],
    fontWeight: 500,
  },

  balanceAmount: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },

  chartWrapper: {
    position: 'relative' as const,
    height: 393,
  },

  chartContainer: {
    width: '100%',
  },

  tooltip: {
    position: 'absolute' as const,
    pointerEvents: 'none' as const,
    padding: 2,
    border: `1px solid ${customPalette.slate[100]}`,
    borderRadius: 1,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
    background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
    bgcolor: '#fefefe',
    zIndex: 10,
  },

  tooltipDate: {
    color: customPalette.slate[800],
    fontWeight: 600,
  },

  tooltipDescription: {
    color: customPalette.slate[500],
  },

  tooltipTransaction: {
    fontWeight: 500,
  },

  tooltipBalance: {
    mt: 1.5,
    color: customPalette.slate[800],
    fontSize: '1.1rem',
    fontWeight: 600,
  },

  footer: {
    borderTop: '1px solid',
    borderColor: 'grey.200',
    background: 'grey.50',
    p: 2,
    mx: -2,
    mb: -2.8,
  },

  footerText: {
    lineHeight: 1.2,
  },

  emptyState: {
    textAlign: 'center' as const,
    py: 10,
    color: customPalette.slate[500],
  },
};