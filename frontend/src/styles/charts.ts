// frontend/src/styles/charts.ts - Chart configurations and styles
import type { SxProps, Theme } from '@mui/material';
import type { DeepPartial, ChartOptions, BaselineSeriesPartialOptions } from 'lightweight-charts';


export const chartStyles = {
  // Chart container and wrapper
  chartWrapper: {
    position: 'relative',
    height: 389,
    mb: 4,
  } as SxProps<Theme>,

  chartContainer: {
    width: '100%',
    height: '410px',
  } as React.CSSProperties,

  // Header styles
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
  } as SxProps<Theme>,

  headerTitle: {
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

  // Footer styles
  footer: {
    borderTop: '1px solid',
    borderColor: 'grey.200',
    background: 'grey.50',
    p: 2,
    mx: -2,
    mb: -3.45,
    mt: 4.35,
  } as SxProps<Theme>,

  footerText: {
    fontSize: '0.875rem',
  } as SxProps<Theme>,

  // Tooltip styles (for custom tooltips like Timeline)
  tooltip: {
    position: 'absolute',
    display: 'none',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid',
    borderColor: 'grey.200',
    borderRadius: 2,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    pointerEvents: 'none',
    zIndex: 1000,
    minWidth: '220px',
    maxWidth: '280px',
  } as SxProps<Theme>,

  tooltipDate: {
    fontWeight: 600,
    color: 'text.primary',
    fontSize: '0.875rem',
    mb: 0.5,
  } as SxProps<Theme>,

  tooltipDescription: {
    color: 'text.secondary',
    fontSize: '0.8rem',
    mb: 1,
    wordWrap: 'break-word',
  } as SxProps<Theme>,

  tooltipTransaction: {
    fontWeight: 500,
    fontSize: '0.8rem',
    mb: 0.5,
  } as SxProps<Theme>,

  tooltipBalance: {
    fontWeight: 700,
    color: 'primary.main',
    fontSize: '0.9rem',
    mt: 1,
    pt: 1,
    borderTop: '1px solid',
    borderColor: 'grey.200',
  } as SxProps<Theme>,

  // Lightweight Charts configuration
  chartConfig: {
    layout: {
      background: { color: 'transparent' },
      textColor: '#64748b',
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
        color: '#059669',
        width: 1,
        style: 3,
        labelBackgroundColor: '#059669',
      },
      horzLine: {
        color: '#059669',
        width: 1,
        style: 3,
        labelBackgroundColor: '#059669',
      },
    },
    timeScale: {
      borderColor: '#e2e8f0',
      timeVisible: true,
      secondsVisible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
    },
    rightPriceScale: {
      borderColor: '#e2e8f0',
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
  } as DeepPartial<ChartOptions>,

  seriesConfig: {
    baseValue: { type: 'price', price: 0 },
    topLineColor: '#10b981',
    topFillColor1: 'rgba(16, 185, 129, 0.28)',
    topFillColor2: 'rgba(16, 185, 129, 0.05)',
    bottomLineColor: '#ef4444',
    bottomFillColor1: 'rgba(239, 68, 68, 0.28)',
    bottomFillColor2: 'rgba(239, 68, 68, 0.05)',
    lineWidth: 2,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
  } as DeepPartial<BaselineSeriesPartialOptions>,
};
