// frontend/src/components/analytics/CategoryPieChart.tsx - pie chart showing spending by cost center
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography, useTheme } from "@mui/material";
import { formatCurrency } from "../../utils/analyticsUtils";
import type { SpendCategoryData } from "../../hooks/useSpendingAnalytics";


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
