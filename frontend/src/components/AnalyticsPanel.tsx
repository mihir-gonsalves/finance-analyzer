// frontend/src/components/AnalyticsPanel.tsx - dashboard analytics (pie charts, top categories, stats)
import { useState } from "react";
import { Card, CardContent, Box, Button, Skeleton } from "@mui/material";
import { DonutLarge, Category as CategoryIcon, Assessment } from "@mui/icons-material";
import { useSpendingAnalytics } from "../hooks/useSpendingAnalytics";
import { SpendingOverview } from "./analytics/SpendingOverview";
import { TopCategoriesList } from "./analytics/TopCategoriesList";
import { QuickStatsView } from "./analytics/QuickStatsView";
import { useTransactionData } from "../context/TransactionContext";

type ViewMode = 'overview' | 'categories' | 'stats';

const VIEW_CONFIG = {
  overview: { icon: DonutLarge, title: 'Cost Center Overview', next: 'categories' as ViewMode },
  categories: { icon: CategoryIcon, title: 'Top Spend Categories', next: 'stats' as ViewMode },
  stats: { icon: Assessment, title: 'Quick Stats', next: 'overview' as ViewMode },
};

export default function AnalyticsPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const { transactions, isLoading } = useTransactionData();
  const analytics = useSpendingAnalytics(transactions);

  // Pie chart ALWAYS shows cost centers
  const pieChartData = analytics.costCenterChartData;

  // Top categories ALWAYS shows spend categories
  const topCategoriesData = analytics.spendCategoryChartData;

  const currentView = VIEW_CONFIG[viewMode];
  const Icon = currentView.icon;

  const cycleView = () => setViewMode(currentView.next);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={520} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: 657.5 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button
            onClick={cycleView}
            sx={{
              color: 'text.primary',
              textTransform: 'none',
              fontSize: '1.25rem',
              fontWeight: 600,
              p: 0,
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'primary.main',
              },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Icon />
            {currentView.title}
          </Button>
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {viewMode === 'overview' && (
            <SpendingOverview
              chartData={pieChartData}
              totalSpent={analytics.totalSpent}
            />
          )}
          {viewMode === 'categories' && (
            <TopCategoriesList
              categories={topCategoriesData}
              totalSpent={analytics.totalSpent}
            />
          )}
          {viewMode === 'stats' && (
            <QuickStatsView analytics={analytics} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
