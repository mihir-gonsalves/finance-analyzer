// frontend/src/components/MoMBarChart.tsx
import { useMemo } from "react";
import { Card, CardContent, Typography, Box, useTheme, Paper } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
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

interface MonthlyData {
  monthKey: string;
  month: string;
  costCenters: Record<string, number>;
  total: number;
  date: Date;
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
  TICK_INTERVAL: 2, // Show every nth label
} as const;

const TOOLTIP_STYLES = {
  container: {
    backgroundColor: '#fff',
    border: '1px solid',
    borderColor: 'grey.200',
    borderRadius: BORDER_RADIUS.lg,
    boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
    padding: '12px',
    minWidth: 200,
    pointerEvents: 'none',
  },
  title: {
    fontWeight: 600,
    mb: 0.5,
  },
  item: {
    fontSize: '0.8125rem',
    color: 'text.secondary',
    mb: 0.5,
  },
} as const;

const AVG_LINE_STYLES = {
  label: {
    position: 'absolute',
    left: 5,
    color: 'white',
    backgroundColor: 'black',
    padding: '2px 4px',
    fontSize: '0.75rem',
    pointerEvents: 'none',
    zIndex: 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  line: {
    position: 'absolute',
    left: CHART_CONFIG.MARGIN.LEFT,
    right: CHART_CONFIG.MARGIN.RIGHT,
    borderTop: '2px dashed rgba(0,0,0,0.6)',
    pointerEvents: 'none',
    zIndex: 1,
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
            No transaction data available
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
      mt: 4.45,
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

    // Get date range
    const dates = transactions
      .map(t => parseDateString(t.date))
      .filter(Boolean);
    
    if (!dates.length) return [];

    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));

    // Build map of monthKey -> cost centers
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

    // Generate all months in range
    const fullMonths: { monthKey: string; date: Date }[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= last) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      fullMonths.push({ monthKey: key, date: new Date(current) });
      current.setMonth(current.getMonth() + 1);
    }

    // Map to monthly data with totals
    return fullMonths.map(({ monthKey, date }) => {
      const costCenters = dataMap.get(monthKey) ?? {};
      const total = Object.values(costCenters).reduce((sum, v) => sum + (v || 0), 0);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return { monthKey, month: monthName, costCenters, total, date };
    });
  }, [transactions]);

  // Prepare series data
  const series = useMemo(() => [{
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

  if (!monthlyData.length) return <EmptyState />;

  // Calculate statistics
  const maxTotal = Math.max(...monthlyData.map(d => d.total ?? 0));
  const avgTotal = monthlyData.reduce((sum, m) => sum + (m.total ?? 0), 0) / monthlyData.length;

  // Calculate average line position
  const DRAWING_HEIGHT = CHART_CONFIG.HEIGHT - CHART_CONFIG.MARGIN.TOP - CHART_CONFIG.MARGIN.BOTTOM;
  const avgLineYPosition = CHART_CONFIG.MARGIN.TOP + ((maxTotal - avgTotal) / maxTotal) * DRAWING_HEIGHT;

  return (
    <Card sx={commonStyles.card.default}>
      <CardContent sx={{ overflow: 'visible' }}>
        <ChartHeader monthCount={monthlyData.length} />

        <Box sx={{ height: 417, width: '100%', overflow: 'visible', position: 'relative' }}>
          {/* Bar Chart */}
          <BarChart
            series={series}
            colors={COLORS}
            xAxis={[{
              scaleType: 'band',
              data: monthlyData.map(d => d.month),
              tickLabelInterval: (_val, idx) => idx % CHART_CONFIG.TICK_INTERVAL === 0,
            }]}
            yAxis={[{ 
              tickNumber: 5, 
              valueFormatter: formatYAxis 
            }]}
            height={CHART_CONFIG.HEIGHT}
            margin={{
              top: CHART_CONFIG.MARGIN.TOP,
              right: CHART_CONFIG.MARGIN.RIGHT,
              bottom: CHART_CONFIG.MARGIN.BOTTOM,
              left: -10,
            }}
            hideLegend
            slots={{ tooltip: CustomTooltip }}
            sx={{
              [`& .MuiBarElement-root:nth-of-type(4n+1)`]: { fill: theme.palette.primary.main },
              [`& .MuiBarElement-root:nth-of-type(4n+2)`]: { fill: theme.palette.secondary.main },
              [`& .MuiBarElement-root:nth-of-type(4n+3)`]: { fill: theme.palette.info.main },
              [`& .MuiBarElement-root:nth-of-type(4n+4)`]: { fill: theme.palette.error.main },
            }}
          />

          {/* Average Line Label */}
          <Typography
            variant="body2"
            sx={{
              ...AVG_LINE_STYLES.label,
              top: `${avgLineYPosition - 10}px`,
            }}
          >
            Avg: {formatCurrency(avgTotal)}
          </Typography>

          {/* Average Line */}
          <Box
            sx={{
              ...AVG_LINE_STYLES.line,
              top: `${avgLineYPosition}px`,
            }}
          />
        </Box>

        <ChartFooter maxTotal={maxTotal} avgTotal={avgTotal} />
      </CardContent>
    </Card>
  );
}
