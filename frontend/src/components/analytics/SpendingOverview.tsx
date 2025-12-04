// frontend/src/components/analytics/SpendingOverview.tsx
import { Box, Typography } from "@mui/material";
import { CategoryPieChart } from "./CategoryPieChart";
import type { SpendCategoryData } from "../../hooks/useSpendingAnalytics";
import { commonStyles } from "../../styles";
import { HEIGHTS } from "../../styles/constants";

// ========================
// TYPE DEFINITIONS
// ========================

interface SpendingOverviewProps {
  chartData: SpendCategoryData[];
  totalSpent: number;
}

// ========================
// CONSTANTS
// ========================

const CONTAINER_STYLES = {
  empty: {
    height: `${HEIGHTS.categoryList}px`,
  },
  chart: {
    height: '563px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
} as const;

// ========================
// SUB-COMPONENTS
// ========================

function EmptyState() {
  return (
    <Box sx={{ ...commonStyles.emptyState.container, ...CONTAINER_STYLES.empty }}>
      <Typography sx={commonStyles.emptyState.description}>
        No spending data available
      </Typography>
    </Box>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function SpendingOverview({ chartData, totalSpent }: SpendingOverviewProps) {
  if (chartData.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box sx={CONTAINER_STYLES.chart}>
      <CategoryPieChart data={chartData} totalSpent={totalSpent} />
    </Box>
  );
}
