// components/LedgerChart.tsx
import { useMemo } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

import { useFilteredTransactions } from "../hooks/useTransactions";
import { chartStyles } from "../theme";
import { formatDateString, parseDateString } from "../utils/dateUtils";
import type { FilterState } from "../types/filters";

interface ChartDataPoint {
  date: string;
  balance: number;
  amount: number;
  description: string;
  formattedDate: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface LedgerChartProps {
  filters: FilterState;
}

export default function LedgerChart({ filters }: LedgerChartProps) {
  const { data: filteredTransactions = [] } = useFilteredTransactions(filters);

  const chartData = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => parseDateString(a.date || '').getTime() - parseDateString(b.date || '').getTime())
      .reduce((acc: ChartDataPoint[], transaction, index) => {
        const previousBalance = index === 0 ? 0 : acc[acc.length - 1]?.balance || 0;
        const newBalance = previousBalance + transaction.amount;

        acc.push({
          date: transaction.date,
          balance: newBalance,
          amount: transaction.amount,
          description: transaction.description,
          formattedDate: formatDateString(transaction.date || '', {
            month: 'short',
            day: 'numeric',
          }),
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

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: chartStyles.colors.background,
          background: chartStyles.tooltip.background,
          p: chartStyles.tooltip.padding,
          border: chartStyles.tooltip.border,
          borderRadius: chartStyles.tooltip.borderRadius,
          boxShadow: chartStyles.tooltip.boxShadow,
          minWidth: chartStyles.tooltip.minWidth,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: chartStyles.colors.textPrimary, fontWeight: 600 }} gutterBottom>
          {formatDateString(data.date, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Typography>
        <Typography variant="body2" sx={{ color: chartStyles.colors.textSecondary }} gutterBottom>
          {data.description}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: data.amount >= 0 ? 'success.main' : 'error.main',
            fontWeight: 500,
          }}
        >
          Transaction: {data.amount >= 0 ? '+' : ''}{formatCurrency(data.amount)}
        </Typography>
        <Typography 
          variant="body1" 
          fontWeight="600" 
          sx={{ 
            mt: 1.5,
            color: chartStyles.colors.textPrimary,
            fontSize: '1.1rem',
          }}
        >
          Balance: {formatCurrency(data.balance)}
        </Typography>
      </Box>
    );
  };

  const ChartGradientDefs = () => (
    <defs>
      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
        {chartStyles.gradientStops.map((stop, index) => (
          <stop 
            key={index}
            offset={stop.offset} 
            stopColor={stop.stopColor} 
            stopOpacity={stop.stopOpacity}
          />
        ))}
      </linearGradient>
    </defs>
  );

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
          <Typography 
            variant="h5" 
            fontWeight="700" 
            sx={{ 
              color: isPositive ? 'success.main' : 'error.main',
              letterSpacing: '-0.02em',
            }}
          >
            {formatCurrency(currentBalance)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const ChartFooter = ({ dataLength, startDate, endDate }: { 
    dataLength: number; 
    startDate: string; 
    endDate: string; 
  }) => (
    <Box sx={{
      mt: 2,
      pt: 2,
      borderTop: '1px solid',
      borderColor: 'grey.200',
      background: 'grey.50',
      borderRadius: 1,
      p: 2,
      mx: -2,
      mb: -2,
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
        Showing {dataLength} transactions •
        From {formatDateString(startDate)} to {formatDateString(endDate)}
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

        <Box sx={{ ...chartStyles.container, height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartStyles.margins}>
              <ChartGradientDefs />
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartStyles.colors.gridStroke} 
                opacity={chartStyles.gridOpacity} 
              />
              
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: chartStyles.colors.textSecondary, fontWeight: 500 }}
              />
              
              <YAxis 
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: chartStyles.colors.textSecondary, fontWeight: 500 }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="balance"
                stroke={chartStyles.colors.primary}
                strokeWidth={chartStyles.strokeWidth}
                fill="url(#balanceGradient)"
                dot={false}
                activeDot={{ 
                  r: chartStyles.activeDot.r, 
                  stroke: chartStyles.colors.primary, 
                  strokeWidth: chartStyles.activeDot.strokeWidth, 
                  fill: 'white',
                  style: { filter: chartStyles.activeDot.dropShadow }
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
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