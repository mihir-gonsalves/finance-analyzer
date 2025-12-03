// frontend/src/components/Timeline.tsx
import { useEffect, useRef, useMemo, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { createChart, BaselineSeries } from "lightweight-charts";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { chartStyles, commonStyles } from "../styles";
import { formatDateString, parseDateString } from "../utils/dateUtils";
import { useTransactionData } from "../context/TransactionContext";

// ========================
// TYPE DEFINITIONS
// ========================

interface TimelineDataPoint {
  date: string;
  balance: number;
  amount: number;
  description: string;
  time: number;
}

interface TooltipData {
  date: string;
  description: string;
  amount: number;
  balance: number;
}

// ========================
// UTILITY FUNCTIONS
// ========================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ========================
// SUB-COMPONENTS
// ========================

function EmptyState() {
  return (
    <Card sx={commonStyles.card.default}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={chartStyles.headerTitle}>
          Account Balance Over Time
        </Typography>
        <Box sx={commonStyles.emptyState.container}>
          <Typography sx={commonStyles.emptyState.description}>
            No transaction data available
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function TimelineHeader({ currentBalance }: { currentBalance: number }) {
  const isPositive = currentBalance >= 0;
  
  return (
    <Box sx={chartStyles.header}>
      <Typography variant="h6" component="h2" sx={chartStyles.headerTitle}>
        Account Balance Over Time
      </Typography>
      <Box sx={chartStyles.balanceDisplay}>
        <Typography variant="body2" sx={chartStyles.balanceLabel}>
          Current Balance
        </Typography>
        <Typography
          variant="h5"
          sx={{
            ...chartStyles.balanceAmount,
            color: isPositive ? 'success.main' : 'error.main',
          }}
        >
          {formatCurrency(currentBalance)}
        </Typography>
      </Box>
    </Box>
  );
}

interface TimelineFooterProps {
  dataLength: number;
  startDate: string;
  endDate: string;
}

function TimelineFooter({ dataLength, startDate, endDate }: TimelineFooterProps) {
  return (
    <Box sx={chartStyles.footer}>
      <Typography variant="body2" color="text.secondary" sx={chartStyles.footerText}>
        Showing {dataLength} transactions • From {formatDateString(startDate)} to {formatDateString(endDate)}
      </Typography>
    </Box>
  );
}

interface CustomTooltipProps {
  data: TooltipData | null;
}

function CustomTooltip({ data }: CustomTooltipProps) {
  if (!data) return null;

  return (
    <>
      <Typography variant="subtitle2" sx={chartStyles.tooltipDate} gutterBottom>
        {formatDateString(data.date, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </Typography>

      <Typography variant="body2" sx={chartStyles.tooltipDescription} gutterBottom>
        {data.description}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          ...chartStyles.tooltipTransaction,
          color: data.amount >= 0 ? 'success.main' : 'error.main',
        }}
      >
        Transaction: {data.amount >= 0 ? '+' : ''}{formatCurrency(data.amount)}
      </Typography>

      <Typography variant="body1" sx={chartStyles.tooltipBalance}>
        Balance: {formatCurrency(data.balance)}
      </Typography>
    </>
  );
}

// ========================
// CONSTANTS
// ========================

const TOOLTIP_OFFSET = {
  DEFAULT: 15,
  WIDTH: 220,
  HEIGHT: 150,
  REVERSE_OFFSET: 235,
  REVERSE_HEIGHT_OFFSET: 165,
} as const;

// ========================
// MAIN COMPONENT
// ========================

export default function Timeline() {
  const { transactions } = useTransactionData();
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Baseline"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // State
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  // Prepare timeline data
  const timelineData = useMemo(() => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => parseDateString(a.date || '').getTime() - parseDateString(b.date || '').getTime()
    );

    return sortedTransactions.reduce((acc: TimelineDataPoint[], transaction, index) => {
      const previousBalance = index === 0 ? 0 : acc[acc.length - 1]?.balance || 0;
      const newBalance = previousBalance + transaction.amount;
      const dateObj = parseDateString(transaction.date || '');

      // Normalize date to midnight
      const normalizedDate = new Date(dateObj);
      normalizedDate.setHours(0, 0, 0, 0);
      let timestamp = Math.floor(normalizedDate.getTime() / 1000);

      // Handle duplicate timestamps
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
  }, [transactions]);

  // Initialize and manage chart
  useEffect(() => {
    if (!containerRef.current || timelineData.length === 0) return;

    // Create chart
    const chart = createChart(containerRef.current, {
      ...chartStyles.chartConfig,
      width: containerRef.current.clientWidth,
    });

    // Add series
    const series = chart.addSeries(BaselineSeries, chartStyles.seriesConfig);
    const seriesData = timelineData.map(d => ({
      time: d.time as Time,
      value: d.balance,
    }));
    series.setData(seriesData);
    chart.timeScale().fitContent();

    // Store refs
    chartRef.current = chart;
    seriesRef.current = series;

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    // Handle crosshair movement (tooltip)
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !tooltipRef.current) {
        setTooltipData(null);
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
        return;
      }

      const dataPoint = timelineData.find(d => d.time === param.time);
      if (!dataPoint) {
        setTooltipData(null);
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
        return;
      }

      // Update tooltip data
      setTooltipData({
        date: dataPoint.date,
        description: dataPoint.description,
        amount: dataPoint.amount,
        balance: dataPoint.balance,
      });

      // Position tooltip
      const coordinate = param.point;
      if (coordinate && containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const tooltip = tooltipRef.current;

        let left = coordinate.x + TOOLTIP_OFFSET.DEFAULT;
        let top = coordinate.y + TOOLTIP_OFFSET.DEFAULT;

        // Adjust if tooltip would overflow right
        if (left + TOOLTIP_OFFSET.WIDTH > container.width) {
          left = coordinate.x - TOOLTIP_OFFSET.REVERSE_OFFSET;
        }

        // Adjust if tooltip would overflow bottom
        if (top + TOOLTIP_OFFSET.HEIGHT > container.height) {
          top = coordinate.y - TOOLTIP_OFFSET.REVERSE_HEIGHT_OFFSET;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.display = 'block';
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [timelineData]);

  // Empty state
  if (timelineData.length === 0) {
    return <EmptyState />;
  }

  // Calculate summary data
  const currentBalance = timelineData[timelineData.length - 1]?.balance || 0;
  const startDate = timelineData[0]?.date;
  const endDate = timelineData[timelineData.length - 1]?.date;

  return (
    <Card sx={commonStyles.card.default}>
      <CardContent>
        <TimelineHeader currentBalance={currentBalance} />

        <Box sx={chartStyles.chartWrapper}>
          {/* Chart Container */}
          <div ref={containerRef} style={chartStyles.chartContainer} />

          {/* Custom Tooltip */}
          <Box
            ref={tooltipRef}
            sx={chartStyles.tooltip}
            style={{ display: 'none' }}
          >
            <CustomTooltip data={tooltipData} />
          </Box>
        </Box>

        <TimelineFooter
          dataLength={timelineData.length}
          startDate={startDate}
          endDate={endDate}
        />
      </CardContent>
    </Card>
  );
}
