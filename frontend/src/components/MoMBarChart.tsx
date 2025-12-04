// frontend/src/components/MoMBarChart.tsx
import { useMemo } from "react";
import { Card, CardContent, Typography, Box, useTheme, Paper } from "@mui/material";
import { ChartContainer } from "@mui/x-charts/ChartContainer";
import { BarPlot } from "@mui/x-charts/BarChart";
import { LinePlot, MarkPlot } from "@mui/x-charts/LineChart";
import { ChartsXAxis } from "@mui/x-charts/ChartsXAxis";
import { ChartsYAxis } from "@mui/x-charts/ChartsYAxis";
import { ChartsTooltipContainer, useItemTooltip } from '@mui/x-charts/ChartsTooltip';
import { useTransactionData } from "../context/TransactionContext";
import { formatCurrency } from "../utils/analyticsUtils";
import { parseDateString } from "../utils/dateUtils";
import { commonStyles, layoutStyles } from "../styles";
import { SPACING, BORDER_RADIUS } from "../styles/constants";

// ========================
// TYPE DEFINITIONS
// ========================

interface CostCenterData {
  center: string;
  amount: string;
  percentage: string;
}

// ========================
// CONSTANTS
// ========================

const CHART_CONFIG = {
  HEIGHT: 500,
  MARGIN: {
    TOP: 30,
    BOTTOM: 70,
    LEFT: 55,
    RIGHT: 30,
  },
  TICK_INTERVAL: 2,
} as const;

const TOOLTIP_STYLES = {
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid',
    borderColor: 'grey.200',
    borderRadius: BORDER_RADIUS.lg,
    boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
    padding: '12px 16px',
    minWidth: 200,
    pointerEvents: 'none',
  },
  title: {
    fontWeight: 600,
    mb: 1.5,
  },
  item: {
    fontSize: '0.8125rem',
    color: 'text.secondary',
    mt: 1,
  },
} as const;

const AVG_LINE_STYLES = {
  lineColor: 'rgba(0, 0, 0, 1)',
  lineWidth: 1,
  lineDashArray: '6 5',
} as const;

const AVG_LABEL_STYLES = {
  container: {
    position: 'absolute',
    transform: 'translateY(-125%)',
    backgroundColor: '#1e293b',
    padding: '4px 5px',
    fontSize: '0.70rem',
    fontWeight: 500,
    fontFamily: 'Inter, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#ffffff',
    zIndex: 10,
    pointerEvents: 'none',
  },
} as const;

// ========================
// UTILITY FUNCTIONS
// ========================

const formatYAxis = (value: number): string => {
  if (!value) return '0';
  if (value >= 1000) {
    const thousands = value / 1000;
    return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(1)}k`;
  }
  return `${Math.round(value)}`;
};

const parseCostCenterData = (formattedValue: string): {
  month: string;
  total: string;
  costCenters: CostCenterData[];
} | null => {
  const parts = formattedValue.split('|');
  if (parts.length < 2) return null;

  const costCenters: CostCenterData[] = [];
  for (let i = 2; i + 2 < parts.length; i += 3) {
    costCenters.push({
      center: parts[i] ?? "Unknown",
      amount: parts[i + 1] ?? "0",
      percentage: parts[i + 2] ?? "0%",
    });
  }

  return {
    month: parts[0],
    total: parts[1],
    costCenters,
  };
};

// ========================
// SUB-COMPONENTS
// ========================

function CustomTooltip() {
  const tooltipData = useItemTooltip();
  
  if (!tooltipData?.formattedValue) return null;

  const parsed = parseCostCenterData(tooltipData.formattedValue);
  if (!parsed) return null;

  const { month, total, costCenters } = parsed;

  return (
    <ChartsTooltipContainer trigger="item">
      <Paper sx={TOOLTIP_STYLES.container}>
        <Typography variant="body2" sx={TOOLTIP_STYLES.title}>
          {month} - {total}
        </Typography>
        {costCenters.map((cc, idx) => (
          <Typography key={idx} variant="body2" sx={TOOLTIP_STYLES.item}>
            {cc.center}: {cc.amount} ({cc.percentage})
          </Typography>
        ))}
      </Paper>
    </ChartsTooltipContainer>
  );
}

function EmptyState() {
  return (
    <Card sx={commonStyles.card.default}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Monthly Spending
        </Typography>
        <Box sx={commonStyles.emptyState.container}>
          <Typography sx={commonStyles.emptyState.description}>
            No spending data available
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

interface ChartHeaderProps {
  monthCount: number;
}

function ChartHeader({ monthCount }: ChartHeaderProps) {
  return (
    <Box sx={layoutStyles.flex.rowBetween} mb={SPACING.md}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Monthly Spending
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Showing {monthCount} months
      </Typography>
    </Box>
  );
}

interface ChartFooterProps {
  maxTotal: number;
  avgTotal: number;
}

function ChartFooter({ maxTotal, avgTotal }: ChartFooterProps) {
  return (
    <Box sx={{
      borderTop: '1px solid',
      borderColor: 'grey.200',
      background: 'grey.50',
      p: SPACING.md,
      mx: -2,
      mb: -3.45,
      mt: 4.6,
    }}>
      <Typography variant="body2" color="text.secondary">
        Peak spending: {formatCurrency(maxTotal)} • Average: {formatCurrency(avgTotal)}
      </Typography>
    </Box>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export default function MoMBarChart() {
  const theme = useTheme();
  const { transactions } = useTransactionData() ?? { transactions: [] };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  // Process monthly data
  const monthlyData = useMemo(() => {
    if (!transactions?.length) return [];

    const dates = transactions
      .map(t => parseDateString(t.date))
      .filter(Boolean);
    
    if (!dates.length) return [];

    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));

    const dataMap = new Map<string, Record<string, number>>();
    
    transactions.forEach(txn => {
      if (!txn?.amount || txn.amount >= 0) return;

      const date = parseDateString(txn.date);
      if (!date) return;

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const costCenterName = txn.cost_center?.name ?? "Uncategorized";
      const monthData = dataMap.get(monthKey) ?? {};
      monthData[costCenterName] = (monthData[costCenterName] ?? 0) + Math.abs(txn.amount);
      dataMap.set(monthKey, monthData);
    });

    const fullMonths: { monthKey: string; date: Date }[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= last) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      fullMonths.push({ monthKey: key, date: new Date(current) });
      current.setMonth(current.getMonth() + 1);
    }

    return fullMonths.map(({ monthKey, date }) => {
      const costCenters = dataMap.get(monthKey) ?? {};
      const total = Object.values(costCenters).reduce((sum, v) => sum + (v || 0), 0);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return { monthKey, month: monthName, costCenters, total, date };
    });
  }, [transactions]);

  // Prepare bar series data
  const barSeries = useMemo(() => [{
    type: 'bar' as const,
    data: monthlyData.map(m => m.total ?? 0),
    label: 'Monthly Total',
    valueFormatter: (value: number | null, context: any) => {
      const idx = context?.dataIndex ?? 0;
      const monthData = monthlyData[idx] ?? { month: '', total: 0, costCenters: {} };
      const val = value ?? monthData.total ?? 0;
      
      const costCenterEntries = Object.entries(monthData.costCenters ?? {})
        .filter(([_, amt]) => amt > 0)
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

      return `${monthData.month}|${formatCurrency(val)}|${costCenterEntries.map(([c, amt]) => {
        const pct = val ? ((amt / val) * 100).toFixed(1) : '0.0';
        return `${c}|${formatCurrency(amt ?? 0)}|${pct}%`;
      }).join('|')}`;
    },
  }], [monthlyData]);

  // Calculate statistics
  const maxTotal = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.total ?? 0)) : 0;
  const avgTotal = monthlyData.length > 0 
    ? monthlyData.reduce((sum, m) => sum + (m.total ?? 0), 0) / monthlyData.length 
    : 0;

  // Prepare average line series with extended range
  const lineSeries = useMemo(() => [{
    type: 'line' as const,
    xAxisId: 'lineXAxis',
    yAxisId: 'leftAxis',
    data: [avgTotal, avgTotal],
    showMark: false,
    color: AVG_LINE_STYLES.lineColor,
  }], [avgTotal]);

  // Check if there's any actual spending data
  const hasSpendingData = monthlyData.length > 0 && maxTotal > 0;

  if (!hasSpendingData) return <EmptyState />;

  // Calculate y-position for average line label
  const yScale = maxTotal > 0 ? (avgTotal / maxTotal) : 0.5;
  const chartHeight = CHART_CONFIG.HEIGHT - CHART_CONFIG.MARGIN.TOP - CHART_CONFIG.MARGIN.BOTTOM;
  const labelTopPosition = CHART_CONFIG.MARGIN.TOP + chartHeight * (1 - yScale);

  const xAxisConfig = [
    {
      id: 'barXAxis',
      scaleType: 'band' as const,
      data: monthlyData.map(d => d.month),
      tickLabelInterval: (_val: any, idx: number) => idx % CHART_CONFIG.TICK_INTERVAL === 0,
    },
    {
      id: 'lineXAxis',
      scaleType: 'linear' as const,
      data: [-0.5, monthlyData.length - 0.5],
      min: -0.5,
      max: monthlyData.length - 0.5,
      tickNumber: 0,
    }
  ];

  const yAxisConfig = [
    { 
      id: 'leftAxis',
      tickNumber: 5, 
      valueFormatter: formatYAxis 
    }
  ];

  return (
    <Card sx={commonStyles.card.default}>
      <CardContent sx={{ overflow: 'visible' }}>
        <ChartHeader monthCount={monthlyData.length} />

        <Box sx={{ height: 417, width: '100%', overflow: 'visible', position: 'relative' }}>
          <Box 
            sx={{
              ...AVG_LABEL_STYLES.container,
              top: `${labelTopPosition}px`,
            }}
          >
            {formatCurrency(avgTotal)}
          </Box>
          
          <ChartContainer
            series={[...barSeries, ...lineSeries]}
            xAxis={xAxisConfig}
            yAxis={yAxisConfig}
            height={CHART_CONFIG.HEIGHT}
            margin={{
              top: CHART_CONFIG.MARGIN.TOP,
              right: CHART_CONFIG.MARGIN.RIGHT,
              bottom: CHART_CONFIG.MARGIN.BOTTOM,
              left: -10,
            }}
            sx={{
              [`& .MuiBarElement-root:nth-of-type(4n+1)`]: { fill: COLORS[0] },
              [`& .MuiBarElement-root:nth-of-type(4n+2)`]: { fill: COLORS[1] },
              [`& .MuiBarElement-root:nth-of-type(4n+3)`]: { fill: COLORS[2] },
              [`& .MuiBarElement-root:nth-of-type(4n+4)`]: { fill: COLORS[3] },
              [`& .MuiLineElement-root`]: {
                strokeDasharray: AVG_LINE_STYLES.lineDashArray,
                strokeWidth: AVG_LINE_STYLES.lineWidth,
              },
            }}
          >
            <BarPlot />
            <LinePlot />
            <MarkPlot />
            <ChartsXAxis axisId="barXAxis" />
            <ChartsYAxis axisId="leftAxis" />
            <CustomTooltip />
          </ChartContainer>
        </Box>

        <ChartFooter maxTotal={maxTotal} avgTotal={avgTotal} />
      </CardContent>
    </Card>
  );
}