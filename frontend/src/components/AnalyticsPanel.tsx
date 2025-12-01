// frontend/src/components/AnalyticsPanel.tsx - dashboard analytics (pie charts, top categories, stats)
import { useState } from "react";
import { Card, CardContent, Box, Button, Skeleton } from "@mui/material";
import { DonutLarge, CategoryRounded as CategoryIcon, AutoAwesomeRounded } from "@mui/icons-material";
import { useSpendingAnalytics } from "../hooks/useSpendingAnalytics";
import { SpendingOverview } from "./analytics/SpendingOverview";
import { TopCategoriesList } from "./analytics/TopCategoriesList";
import { QuickStatsView } from "./analytics/QuickStatsView";
import { useTransactionData } from "../context/TransactionContext";
import { commonStyles, layoutStyles, combineStyles } from "../styles";


type ViewMode = 'overview' | 'categories' | 'stats';


const VIEW_CONFIG = {
  overview: { icon: DonutLarge, title: 'Cost Center Overview', next: 'categories' as ViewMode },
  categories: { icon: CategoryIcon, title: 'Top Spend Categories', next: 'stats' as ViewMode },
  stats: { icon: AutoAwesomeRounded, title: 'Quick Stats', next: 'overview' as ViewMode },
};


export default function AnalyticsPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const { transactions, isLoading } = useTransactionData();
  const analytics = useSpendingAnalytics(transactions);

  const pieChartData = analytics.costCenterChartData;
  const topCategoriesData = analytics.spendCategoryChartData;
  const currentView = VIEW_CONFIG[viewMode];
  const Icon = currentView.icon;

  const cycleView = () => setViewMode(currentView.next);

  if (isLoading) {
    return (
      <Card sx={commonStyles.card.default}>
        <CardContent>
          <Box sx={layoutStyles.flex.rowBetween} mb={2}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={520} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ ...commonStyles.card.elevated, height: 658 }}>
      <CardContent sx={layoutStyles.cardLayout.fullHeight}>
        <Box sx={layoutStyles.cardLayout.header}>
          <Button
            onClick={cycleView}
            sx={combineStyles(
              commonStyles.button.text,
              commonStyles.typography.cardTitle,
              {
                fontSize: '1.25rem',
                p: 0,
                gap: 1.5,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'primary.main',
                },
              }
            )}
          >
            <Icon />
            {currentView.title}
          </Button>
        </Box>

        <Box sx={layoutStyles.cardLayout.body}>
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
