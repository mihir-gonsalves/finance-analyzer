// frontend/src/components/analytics/SpendingOverview.tsx
import { Box, Typography } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { CategoryPieChart } from "./CategoryPieChart";
import type { CategoryData } from "../../hooks/useSpendingAnalytics";


interface SpendingOverviewProps {
  chartData: CategoryData[];
  totalSpent: number;
}


export function SpendingOverview({ chartData, totalSpent }: SpendingOverviewProps) {
  if (chartData.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ height: '520px' }}
      >
        <CategoryIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
        <Typography color="text.secondary" variant="body2">
          No spending data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ height: '530px' }}
    >
      <CategoryPieChart data={chartData} totalSpent={totalSpent} />
    </Box>
  );
}
