// frontend/src/components/analytics/CategoryPieChart.tsx - pie chart showing spending by cost center
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography, useTheme } from "@mui/material";
import { formatCurrency } from "../../utils/analyticsUtils";
import type { SpendCategoryData } from "../../hooks/useSpendingAnalytics";
import { chartsTooltipClasses } from '@mui/x-charts/ChartsTooltip';


interface CategoryPieChartProps {
  data: SpendCategoryData[];
  totalSpent: number;
}


export function CategoryPieChart({ data, totalSpent }: CategoryPieChartProps) {
  const theme = useTheme();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  // Prepare chart data
  const chartData = data.map((item, index) => ({
    id: index,
    value: item.value,
    label: item.name,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Box position="relative" height="100%" width="100%">
      <PieChart
        series={[
          {
            data: chartData,
            innerRadius: 115,
            outerRadius: 165,
            paddingAngle: 0,
            highlightScope: { fade: "global", highlight: "item" },
            valueFormatter: (item) => {
              const percentage = ((item.value / totalSpent) * 100).toFixed(1);
              return `${formatCurrency(item.value)} (${percentage}%)`;
            },
          },
        ]}
        hideLegend
        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        slotProps={{
          tooltip: {
            sx: {
              [`& .${chartsTooltipClasses.paper}`]: {
                backgroundColor: '#ffffff',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
                padding: '12px',
              },
              [`& .${chartsTooltipClasses.table}`]: {
                borderSpacing: '0px',
              },
              [`& .${chartsTooltipClasses.labelCell}`]: {
                color: 'text.secondary',
                fontSize: '0.8rem',
                fontWeight: 500,
              },
              [`& .${chartsTooltipClasses.valueCell}`]: {
                color: 'text.primary',
                fontSize: '0.8rem',
                fontWeight: 600,
              },
            },
          },
        }}
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        sx={{
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <Typography
          variant="h4"
          color="primary.main"
          sx={{ letterSpacing: "-0.02em" }}
        >
          {formatCurrency(totalSpent)}
        </Typography>
        <Typography color="text.secondary" fontWeight="600">
          Total Spent
        </Typography>
      </Box>
    </Box>
  );
}
