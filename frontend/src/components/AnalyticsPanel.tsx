// frontend/src/components/AnalyticsPanel.tsx
import { useState } from "react";
import { Card, CardContent, Box, Button, Skeleton } from "@mui/material";
import { DonutLarge, CategoryRounded, AutoAwesomeRounded } from "@mui/icons-material";
import { useSpendingAnalytics } from "../hooks/useSpendingAnalytics";
import { SpendingOverview } from "./analytics/SpendingOverview";
import { TopCategoriesList } from "./analytics/TopCategoriesList";
import { QuickStatsView } from "./analytics/QuickStatsView";
import { useTransactionData } from "../context/TransactionContext";
import { commonStyles, layoutStyles, combineStyles } from "../styles";
import { HEIGHTS, SPACING } from "../styles/constants";

type ViewMode = 'overview' | 'categories' | 'stats';

interface ViewConfig {
  icon: typeof DonutLarge;
  title: string;
  next: ViewMode;
}

const VIEW_MODES: Record<ViewMode, ViewConfig> = {
  overview: {
    icon: DonutLarge,
    title: 'Cost Center Overview',
    next: 'categories',
  },
  categories: {
    icon: CategoryRounded,
    title: 'Top Spend Categories',
    next: 'stats',
  },
  stats: {
    icon: AutoAwesomeRounded,
    title: 'Quick Stats',
    next: 'overview',
  },
};

const PANEL_STYLES = {
  card: {
    height: HEIGHTS.analyticsPanel,
  },
  
  toggleButton: {
    fontSize: '1.25rem',
    p: 0,
    gap: 1.5,
    minWidth: 'auto',
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'primary.main',
    },
  },
} as const;

function LoadingSkeleton() {
  return (
    <Card sx={commonStyles.card.default}>
      <CardContent>
        <Box sx={layoutStyles.flex.rowBetween} mb={SPACING.md}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={520} />
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const { transactions, isLoading } = useTransactionData();
  const analytics = useSpendingAnalytics(transactions);

  const currentView = VIEW_MODES[viewMode];
  const Icon = currentView.icon;

  const cycleView = () => setViewMode(currentView.next);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card sx={{ ...commonStyles.card.elevated, ...PANEL_STYLES.card }}>
      <CardContent sx={layoutStyles.cardLayout.fullHeight}>
        {/* Header with View Toggle */}
        <Box sx={layoutStyles.cardLayout.header}>
          <Button
            onClick={cycleView}
            sx={combineStyles(
              commonStyles.button.text,
              commonStyles.typography.cardTitle,
              PANEL_STYLES.toggleButton
            )}
          >
            <Icon />
            {currentView.title}
          </Button>
        </Box>

        {/* Content Area */}
        <Box sx={layoutStyles.cardLayout.body}>
          {viewMode === 'overview' && (
            <SpendingOverview
              chartData={analytics.costCenterChartData}
              totalSpent={analytics.totalSpent}
            />
          )}
          {viewMode === 'categories' && (
            <TopCategoriesList
              categories={analytics.spendCategoryChartData}
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
