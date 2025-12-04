// frontend/src/components/analytics/CategoryPieChart.tsx
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography, useTheme } from "@mui/material";
import { formatCurrency } from "../../utils/analyticsUtils";
import type { SpendCategoryData } from "../../hooks/useSpendingAnalytics";
import { chartsTooltipClasses } from '@mui/x-charts/ChartsTooltip';
import { BORDER_RADIUS } from "../../styles/constants";

// ========================
// TYPE DEFINITIONS
// ========================

interface CategoryPieChartProps {
  data: SpendCategoryData[];
  totalSpent: number;
}

interface ChartDataPoint {
  id: number;
  value: number;
  label: string;
  color: string;
}

// ========================
// CONSTANTS
// ========================

const PIE_CHART_CONFIG = {
  INNER_RADIUS: 115,
  OUTER_RADIUS: 165,
  PADDING_ANGLE: 0,
} as const;

const CHART_MARGIN = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
} as const;

/**
 * MUI X-Charts uses a special tooltip system with CSS classes
 * that requires this specific nested structure for styling
 */
const TOOLTIP_STYLES = {
  sx: {
    // Tooltip paper (container)
    [`& .${chartsTooltipClasses.paper}`]: {
      backgroundColor: '#ffffff',
      border: '1px solid',
      borderColor: 'grey.200',
      borderRadius: BORDER_RADIUS.lg,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
      padding: '8px',
    },
    // Tooltip table spacing
    [`& .${chartsTooltipClasses.table}`]: {
      borderSpacing: '0px',
    },
    // Label cell (left side)
    [`& .${chartsTooltipClasses.labelCell}`]: {
      color: 'text.secondary',
      fontSize: '0.8rem',
      fontWeight: 500,
    },
    // Value cell (right side)
    [`& .${chartsTooltipClasses.valueCell}`]: {
      color: 'text.primary',
      fontSize: '0.8rem',
      fontWeight: 600,
    },
  },
} as const;

const CENTER_LABEL_STYLES = {
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  amount: {
    letterSpacing: '-0.02em',
  },
  label: {
    fontWeight: 600,
  },
} as const;

// ========================
// UTILITY FUNCTIONS
// ========================

const formatChartValue = (value: number, totalSpent: number): string => {
  const percentage = ((value / totalSpent) * 100).toFixed(1);
  return `${formatCurrency(value)} (${percentage}%)`;
};

// ========================
// MAIN COMPONENT
// ========================

export function CategoryPieChart({ data, totalSpent }: CategoryPieChartProps) {
  const theme = useTheme();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  // Prepare chart data with colors
  const chartData: ChartDataPoint[] = data.map((item, index) => ({
    id: index,
    value: item.value,
    label: item.name,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Box position="relative" height="100%" width="100%">
      {/* Pie Chart */}
      <PieChart
        series={[
          {
            data: chartData,
            innerRadius: PIE_CHART_CONFIG.INNER_RADIUS,
            outerRadius: PIE_CHART_CONFIG.OUTER_RADIUS,
            paddingAngle: PIE_CHART_CONFIG.PADDING_ANGLE,
            highlightScope: { fade: "global", highlight: "item" },
            valueFormatter: (item) => formatChartValue(item.value, totalSpent),
          },
        ]}
        hideLegend
        margin={CHART_MARGIN}
        slotProps={{
          tooltip: TOOLTIP_STYLES,
        }}
      />

      {/* Center Label */}
      <Box sx={CENTER_LABEL_STYLES.container}>
        <Typography
          variant="h4"
          color="primary.main"
          sx={CENTER_LABEL_STYLES.amount}
        >
          {formatCurrency(totalSpent)}
        </Typography>
        <Typography
          color="text.secondary"
          sx={CENTER_LABEL_STYLES.label}
        >
          Total Spent
        </Typography>
      </Box>
    </Box>
  );
}
