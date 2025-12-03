// frontend/src/components/Timeline.tsx
import { useEffect, useRef, useMemo, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { createChart, BaselineSeries } from "lightweight-charts";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { chartStyles, commonStyles } from "../styles";
import { formatDateString, parseDateString } from "../utils/dateUtils";
import { formatCurrency } from "../utils/analyticsUtils";
import { useTransactionData } from "../context/TransactionContext";

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

const TOOLTIP_OFFSET = {
  DEFAULT: 15,
  WIDTH: 220,
  HEIGHT: 150,
  REVERSE: 235,
  REVERSE_HEIGHT: 165,
};

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
            color: currentBalance >= 0 ? 'success.main' : 'error.main',
          }}
        >
          {formatCurrency(currentBalance)}
        </Typography>
      </Box>
    </Box>
  );
}

function TimelineFooter({ dataLength, startDate, endDate }: { 
  dataLength: number; 
  startDate: string; 
  endDate: string; 
}) {
  return (
    <Box sx={chartStyles.footer}>
      <Typography variant="body2" color="text.secondary" sx={chartStyles.footerText}>
        Showing {dataLength} transactions • From {formatDateString(startDate)} to {formatDateString(endDate)}
      </Typography>
    </Box>
  );
}

function CustomTooltip({ data }: { data: TooltipData | null }) {
  if (!data) return null;

  return (
    <>
      <Typography variant="subtitle2" sx={chartStyles.tooltipDate} gutterBottom>
        {formatDateString(data.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
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

export default function Timeline() {
  const { transactions } = useTransactionData();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Baseline"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  const timelineData = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => parseDateString(a.date || '').getTime() - parseDateString(b.date || '').getTime()
    );

    return sorted.reduce((acc: TimelineDataPoint[], transaction, index) => {
      const previousBalance = index === 0 ? 0 : acc[acc.length - 1]?.balance || 0;
      const newBalance = previousBalance + transaction.amount;
      const dateObj = parseDateString(transaction.date || '');

      const normalizedDate = new Date(dateObj);
      normalizedDate.setHours(0, 0, 0, 0);
      let timestamp = Math.floor(normalizedDate.getTime() / 1000);

      while (acc.some(item => item.time === timestamp)) {
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

  useEffect(() => {
    if (!containerRef.current || timelineData.length === 0) return;

    const chart = createChart(containerRef.current, {
      ...chartStyles.chartConfig,
      width: containerRef.current.clientWidth,
    });

    const series = chart.addSeries(BaselineSeries, chartStyles.seriesConfig);
    const seriesData = timelineData.map(d => ({
      time: d.time as Time,
      value: d.balance,
    }));
    series.setData(seriesData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !tooltipRef.current) {
        setTooltipData(null);
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        return;
      }

      const dataPoint = timelineData.find(d => d.time === param.time);
      if (!dataPoint) {
        setTooltipData(null);
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        return;
      }

      setTooltipData({
        date: dataPoint.date,
        description: dataPoint.description,
        amount: dataPoint.amount,
        balance: dataPoint.balance,
      });

      const coordinate = param.point;
      if (coordinate && containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const tooltip = tooltipRef.current;

        let left = coordinate.x + TOOLTIP_OFFSET.DEFAULT;
        let top = coordinate.y + TOOLTIP_OFFSET.DEFAULT;

        if (left + TOOLTIP_OFFSET.WIDTH > container.width) {
          left = coordinate.x - TOOLTIP_OFFSET.REVERSE;
        }

        if (top + TOOLTIP_OFFSET.HEIGHT > container.height) {
          top = coordinate.y - TOOLTIP_OFFSET.REVERSE_HEIGHT;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.display = 'block';
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [timelineData]);

  if (timelineData.length === 0) return <EmptyState />;

  const currentBalance = timelineData[timelineData.length - 1]?.balance || 0;
  const startDate = timelineData[0]?.date;
  const endDate = timelineData[timelineData.length - 1]?.date;

  return (
    <Card sx={commonStyles.card.default}>
      <CardContent>
        <TimelineHeader currentBalance={currentBalance} />

        <Box sx={chartStyles.chartWrapper}>
          <div ref={containerRef} style={chartStyles.chartContainer} />

          <Box ref={tooltipRef} sx={chartStyles.tooltip} style={{ display: 'none' }}>
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
