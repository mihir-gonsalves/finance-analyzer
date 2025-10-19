// frontend/src/components/LedgerChart.tsx
import { useEffect, useRef, useMemo, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { createChart, BaselineSeries } from "lightweight-charts";
import type { IChartApi, Time } from "lightweight-charts";
import { chartStyles } from "../styles/charts";
import { formatDateString, parseDateString } from "../utils/dateUtils";
import { useTransactionData } from "../context/TransactionContext";

interface ChartDataPoint {
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


const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};


const EmptyState = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom sx={chartStyles.headerTitle}>
        Account Balance Over Time
      </Typography>
      <Box sx={chartStyles.emptyState}>
        <Typography sx={chartStyles.tooltipDescription}>
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
};


const ChartFooter = ({
  dataLength,
  startDate,
  endDate
}: {
  dataLength: number;
  startDate: string;
  endDate: string
}) => (
  <Box sx={chartStyles.footer}>
    <Typography variant="body2" color="text.secondary" sx={chartStyles.footerText}>
      Showing {dataLength} transactions • From {formatDateString(startDate)} to {formatDateString(endDate)}
    </Typography>
  </Box>
);


export default function LedgerChart() {
  const { transactions } = useTransactionData();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);


  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => parseDateString(a.date || '').getTime() - parseDateString(b.date || '').getTime()
  );

  const chartData = useMemo(() => {
    return sortedTransactions.reduce((acc: ChartDataPoint[], transaction, index) => {
      const previousBalance = index === 0 ? 0 : acc[acc.length - 1]?.balance || 0;
      const newBalance = previousBalance + transaction.amount;
      const dateObj = parseDateString(transaction.date || '');

      const normalizedDate = new Date(dateObj);
      normalizedDate.setHours(0, 0, 0, 0);
      let timestamp = Math.floor(normalizedDate.getTime() / 1000);

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
  }, [sortedTransactions]);

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      ...chartStyles.chartConfig,
      width: chartContainerRef.current.clientWidth,
    });

    const series = chart.addSeries(BaselineSeries, chartStyles.seriesConfig);

    const seriesData = chartData.map(d => ({
      time: d.time as Time,
      value: d.balance,
    }));

    series.setData(seriesData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !tooltipRef.current) {
        setTooltipData(null);
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
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

        const coordinate = param.point;
        if (coordinate && chartContainerRef.current) {
          const container = chartContainerRef.current.getBoundingClientRect();
          const tooltip = tooltipRef.current;

          let left = coordinate.x + 15;
          let top = coordinate.y + 15;

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
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return <EmptyState />;
  }

  const currentBalance = chartData[chartData.length - 1]?.balance || 0;
  const startDate = chartData[0]?.date;
  const endDate = chartData[chartData.length - 1]?.date;

  return (
    <Card>
      <CardContent>
        <ChartHeader currentBalance={currentBalance} />

        <Box sx={chartStyles.chartWrapper}>
          <div ref={chartContainerRef} style={chartStyles.chartContainer} />

          <Box
            ref={tooltipRef}
            sx={chartStyles.tooltip}
            style={{ display: 'none' }}
          >
            {tooltipData && (
              <>
                <Typography variant="subtitle2" sx={chartStyles.tooltipDate} gutterBottom>
                  {formatDateString(tooltipData.date, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>

                <Typography variant="body2" sx={chartStyles.tooltipDescription} gutterBottom>
                  {tooltipData.description}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    ...chartStyles.tooltipTransaction,
                    color: tooltipData.amount >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  Transaction: {tooltipData.amount >= 0 ? '+' : ''}{formatCurrency(tooltipData.amount)}
                </Typography>

                <Typography variant="body1" sx={chartStyles.tooltipBalance}>
                  Balance: {formatCurrency(tooltipData.balance)}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        <ChartFooter
          dataLength={chartData.length}
          startDate={startDate}
          endDate={endDate}
        />
      </CardContent>
    </Card>
  );
}