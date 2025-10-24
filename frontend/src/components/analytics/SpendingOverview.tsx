// frontend/src/components/analytics/SpendingOverview.tsx - high-level spending summary cards
import { Box, Typography } from "@mui/material";
import { CategoryPieChart } from "./CategoryPieChart";
import type { SpendCategoryData } from "../../hooks/useSpendingAnalytics";


interface SpendingOverviewProps {
  chartData: SpendCategoryData[];
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
        <Typography color="text.secondary" variant="body2">
          No spending data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '563px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CategoryPieChart data={chartData} totalSpent={totalSpent} />
    </Box>
  );
}
