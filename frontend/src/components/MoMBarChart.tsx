// frontend/src/components/MoMBarChart.tsx - Super safe Monthly spending bar chart
import { useMemo } from "react";
import { Card, CardContent, Typography, Box, useTheme, Paper } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { ChartsTooltipContainer, useItemTooltip } from '@mui/x-charts/ChartsTooltip';
import { useTransactionData } from "../context/TransactionContext";
import { formatCurrency } from "../utils/analyticsUtils";
import { parseDateString } from "../utils/dateUtils";
import { commonStyles } from "../styles";

// Safe tooltip
function CustomTooltip() {
  const tooltipData = useItemTooltip();
  if (!tooltipData || !tooltipData.formattedValue) return null;

  const { formattedValue } = tooltipData;
  const parts = formattedValue.split('|');
  if (parts.length < 2) return null;

  const month = parts[0];
  const total = parts[1];

  const costCenters: { center: string; amount: string; percentage: string }[] = [];
  for (let i = 2; i + 2 < parts.length; i += 3) {
    costCenters.push({
      center: parts[i] ?? "Unknown",
      amount: parts[i + 1] ?? "0",
      percentage: parts[i + 2] ?? "0%",
    });
  }

  return (
    <ChartsTooltipContainer trigger="item">
      <Paper sx={{
        backgroundColor: '#fff',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        padding: '12px',
        minWidth: 200,
        pointerEvents: 'none',
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {month} - {total}
        </Typography>
        {costCenters.map((cc, idx) => (
          <Typography key={idx} variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 0.5 }}>
            {cc.center}: {cc.amount} ({cc.percentage})
          </Typography>
        ))}
      </Paper>
    </ChartsTooltipContainer>
  );
}

// Empty state
const EmptyState = () => (
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

// Y-axis formatter
const formatYAxis = (value: number): string => {
  if (!value) return '0';
  if (value >= 1000) {
    const thousands = value / 1000;
    return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(1)}k`;
  }
  return `${Math.round(value)}`;
};

export default function MoMBarChart() {
  const theme = useTheme();
  const { transactions } = useTransactionData() ?? { transactions: [] };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  const monthlyData = useMemo(() => {
    if (!transactions?.length) return [];

    // Determine the range from filter (or transactions min/max dates)
    const dates = transactions.map(t => parseDateString(t.date)).filter(Boolean);
    if (!dates.length) return [];

    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));

    // Build map of monthKey -> costCenters
    const dataMap = new Map<string, Record<string, number>>();
    transactions.forEach(txn => {
      if (!txn?.amount || txn.amount >= 0) return;

      const date = parseDateString(txn.date);
      if (!date) return;

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}`;
      const costCenterName = txn.cost_center?.name ?? "Uncategorized";
      const monthData = dataMap.get(monthKey) ?? {};
      monthData[costCenterName] = (monthData[costCenterName] ?? 0) + Math.abs(txn.amount);
      dataMap.set(monthKey, monthData);
    });

    // Generate all months in range
    const fullMonths: { monthKey: string; date: Date }[] = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= last) {
      const key = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}`;
      fullMonths.push({ monthKey: key, date: new Date(current) });
      current.setMonth(current.getMonth() + 1);
    }

    return fullMonths.map(({monthKey, date}) => {
      const costCenters = dataMap.get(monthKey) ?? {};
      const total = Object.values(costCenters).reduce((sum, v) => sum + (v || 0), 0);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return { monthKey, month: monthName, costCenters, total, date };
    });
  }, [transactions]);

  if (!monthlyData.length) return <EmptyState />;

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

  const maxTotal = Math.max(...monthlyData.map(d => d.total ?? 0));
  const avgTotal = monthlyData.reduce((sum, m) => sum + (m.total ?? 0), 0) / monthlyData.length;

  const CHART_HEIGHT = 500;
  const MARGIN_TOP = 30;
  const MARGIN_BOTTOM = 70;
  const MARGIN_LEFT = 55;
  const MARGIN_RIGHT = 30;
  const DRAWING_HEIGHT = CHART_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
  const avgLineYPosition = MARGIN_TOP + ((maxTotal - avgTotal) / maxTotal) * DRAWING_HEIGHT;

  return (
    <Card sx={commonStyles.card.default}>
      <CardContent sx={{ overflow: 'visible' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Monthly Spending
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {monthlyData.length} months
          </Typography>
        </Box>

        <Box sx={{ height: 417, width: '100%', overflow: 'visible', position: 'relative' }}>
          <BarChart
            series={series}
            colors={COLORS}
            xAxis={[{
              scaleType: 'band',
              data: monthlyData.map(d => d.month),
              tickLabelInterval: (_val, idx) => idx % 2 === 0,
            }]}
            yAxis={[{ tickNumber: 5, valueFormatter: formatYAxis }]}
            height={CHART_HEIGHT}
            margin={{ top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: MARGIN_BOTTOM, left: -10 }}
            hideLegend
            slots={{ tooltip: CustomTooltip }}
            sx={{
              [`& .MuiBarElement-root:nth-of-type(4n+1)`]: { fill: theme.palette.primary.main },
              [`& .MuiBarElement-root:nth-of-type(4n+2)`]: { fill: theme.palette.secondary.main },
              [`& .MuiBarElement-root:nth-of-type(4n+3)`]: { fill: theme.palette.info.main },
              [`& .MuiBarElement-root:nth-of-type(4n+4)`]: { fill: theme.palette.error.main },
            }}
          />
          <Typography variant="body2" sx={{
            position: 'absolute',
            left: 5,
            top: `${avgLineYPosition - 10}px`,
            color: 'white',
            backgroundColor: 'black',
            padding: '2px 4px',
            fontSize: '0.75rem',
            pointerEvents: 'none',
            zIndex: 2,
            borderRadius: 2,
          }}>
            Avg: {formatCurrency(avgTotal)}
          </Typography>
          <Box sx={{
            position: 'absolute',
            left: MARGIN_LEFT,
            right: MARGIN_RIGHT,
            top: `${avgLineYPosition}px`,
            borderTop: '2px dashed rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        </Box>

        <Box sx={{ borderTop: '1px solid', borderColor: 'grey.200', background: 'grey.50', p: 2, mx: -2, mb: -3.45, mt: 4.45 }}>
          <Typography variant="body2" color="text.secondary">
            Peak spending: {formatCurrency(maxTotal)} • Average: {formatCurrency(avgTotal)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
