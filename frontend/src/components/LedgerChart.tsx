// frontend/src/components/LedgerChart.tsx
import { useEffect, useRef, useMemo, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { createChart, ColorType, LineStyle, BaselineSeries } from "lightweight-charts";
import type { IChartApi, Time } from "lightweight-charts";
import { useFilteredTransactions } from "../hooks/useTransactions";
import { chartStyles } from "../styles/charts";
import { formatDateString, parseDateString } from "../utils/dateUtils";
import type { FilterState } from "../types/filters";

interface ChartDataPoint {
  date: string;
  balance: number;
  amount: number;
  description: string;
  time: number; // Unix timestamp
}

interface TooltipData {
  date: string;
  description: string;
  amount: number;
  balance: number;
}

interface LedgerChartProps {
  filters: FilterState;
}

export default function LedgerChart({ filters }: LedgerChartProps) {
  const { data: filteredTransactions = [] } = useFilteredTransactions(filters);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  const chartData = useMemo(() => {
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => parseDateString(a.date || '').getTime() - parseDateString(b.date || '').getTime()
    );

    return sortedTransactions.reduce((acc: ChartDataPoint[], transaction, index) => {
      const previousBalance = index === 0 ? 0 : acc[acc.length - 1]?.balance || 0;
      const newBalance = previousBalance + transaction.amount;
      const dateObj = parseDateString(transaction.date || '');
      
      // Normalize to start of day (midnight) to ensure consistent timestamps
      const normalizedDate = new Date(dateObj);
      normalizedDate.setHours(0, 0, 0, 0);
      let timestamp = Math.floor(normalizedDate.getTime() / 1000);
      
      // If there's a previous entry with the same timestamp, increment by 1 second
      // This handles multiple transactions on the same day
      while (acc.length > 0 && acc.some(item => item.time === timestamp)) {
        timestamp += 1;
      }
      
      acc.push({
        date: transaction.date,
        balance: newBalance,
        amount: transaction.amount,
        description: transaction.description,
        time: timestamp,
      });
      return acc;
    }, []);
  }, [filteredTransactions]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: chartStyles.colors.textSecondary,
        background: { type: ColorType.Solid, color: chartStyles.colors.background },
      },
      width: chartContainerRef.current.clientWidth,
      height: 380,
      grid: {
        vertLines: { color: chartStyles.colors.gridStroke, style: LineStyle.Solid, visible: true },
        horzLines: { color: chartStyles.colors.gridStroke, style: LineStyle.Solid, visible: true },
      },
      rightPriceScale: {
        borderColor: chartStyles.colors.gridStroke,
      },
      timeScale: {
        borderColor: chartStyles.colors.gridStroke,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: 0 },
      topLineColor: chartStyles.colors.primary,
      topFillColor1: 'rgba(16, 185, 129, 0.28)',
      topFillColor2: 'rgba(16, 185, 129, 0.05)',
      bottomLineColor: 'rgba(239, 83, 80, 1)',
      bottomFillColor1: 'rgba(239, 83, 80, 0.05)',
      bottomFillColor2: 'rgba(239, 83, 80, 0.28)',
      lineWidth: 3,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: chartStyles.colors.primary,
      crosshairMarkerBackgroundColor: 'white',
    });

    // Convert data to lightweight-charts format
    const seriesData = chartData.map(d => ({
      time: d.time as Time,
      value: d.balance,
    }));

    series.setData(seriesData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    // Handle chart resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Crosshair move subscription for tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !tooltipRef.current) {
        setTooltipData(null);
        return;
      }

      const dataPoint = chartData.find(d => d.time === param.time);
      if (dataPoint) {
        setTooltipData({
          date: dataPoint.date,
          description: dataPoint.description,
          amount: dataPoint.amount,
          balance: dataPoint.balance,
        });

        // Position tooltip
        const coordinate = param.point;
        if (coordinate && chartContainerRef.current) {
          const container = chartContainerRef.current.getBoundingClientRect();
          const tooltip = tooltipRef.current;
          
          let left = coordinate.x + 15;
          let top = coordinate.y + 15;

          // Keep tooltip within bounds
          if (left + 220 > container.width) {
            left = coordinate.x - 235;
          }
          if (top + 150 > container.height) {
            top = coordinate.y - 165;
          }

          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
          tooltip.style.display = 'block';
        }
      } else {
        setTooltipData(null);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData]);

  const EmptyState = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: chartStyles.colors.textPrimary }}>
          Account Balance Over Time
        </Typography>
        <Box sx={chartStyles.emptyState}>
          <Typography sx={{ color: chartStyles.colors.textSecondary }}>
            No transaction data available
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const ChartHeader = ({ currentBalance }: { currentBalance: number }) => {
    const isPositive = currentBalance >= 0;
    return (
      <Box sx={chartStyles.header}>
        <Typography variant="h6" component="h2" sx={{ color: chartStyles.colors.textPrimary, fontWeight: 600 }}>
          Account Balance Over Time
        </Typography>
        <Box sx={chartStyles.balanceDisplay}>
          <Typography variant="body2" sx={{ color: chartStyles.colors.textSecondary, fontWeight: 500 }}>
            Current Balance
          </Typography>
          <Typography variant="h5" fontWeight="700" sx={{ color: isPositive ? 'success.main' : 'error.main', letterSpacing: '-0.02em' }}>
            {formatCurrency(currentBalance)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const ChartFooter = ({ dataLength, startDate, endDate }: { dataLength: number; startDate: string; endDate: string }) => (
    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200', background: 'grey.50', borderRadius: 1, p: 2, mx: -2, mb: -2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
        Showing {dataLength} transactions • From {formatDateString(startDate)} to {formatDateString(endDate)}
      </Typography>
    </Box>
  );

  if (chartData.length === 0) {
    return <EmptyState />;
  }

  const currentBalance = chartData[chartData.length - 1]?.balance || 0;
  const startDate = chartData[0]?.date;
  const endDate = chartData[chartData.length - 1]?.date;

  return (
    <Card>
      <CardContent sx={{ pb: 1 }}>
        <ChartHeader currentBalance={currentBalance} />
        <Box sx={{ position: 'relative', ...chartStyles.container, height: 380 }}>
          <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
          
          {/* Custom Tooltip */}
          <Box
            ref={tooltipRef}
            sx={{
              display: tooltipData ? 'block' : 'none',
              position: 'absolute',
              pointerEvents: 'none',
              bgcolor: chartStyles.colors.background,
              background: chartStyles.tooltip.background,
              p: chartStyles.tooltip.padding,
              border: chartStyles.tooltip.border,
              borderRadius: chartStyles.tooltip.borderRadius,
              boxShadow: chartStyles.tooltip.boxShadow,
              minWidth: chartStyles.tooltip.minWidth,
              zIndex: 10,
            }}
          >
            {tooltipData && (
              <>
                <Typography variant="subtitle2" sx={{ color: chartStyles.colors.textPrimary, fontWeight: 600 }} gutterBottom>
                  {formatDateString(tooltipData.date, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
                <Typography variant="body2" sx={{ color: chartStyles.colors.textSecondary }} gutterBottom>
                  {tooltipData.description}
                </Typography>
                <Typography variant="body2" sx={{ color: tooltipData.amount >= 0 ? 'success.main' : 'error.main', fontWeight: 500 }}>
                  Transaction: {tooltipData.amount >= 0 ? '+' : ''}{formatCurrency(tooltipData.amount)}
                </Typography>
                <Typography variant="body1" fontWeight="600" sx={{ mt: 1.5, color: chartStyles.colors.textPrimary, fontSize: '1.1rem' }}>
                  Balance: {formatCurrency(tooltipData.balance)}
                </Typography>
              </>
            )}
          </Box>
        </Box>
        <ChartFooter dataLength={chartData.length} startDate={startDate} endDate={endDate} />
      </CardContent>
    </Card>
  );
}