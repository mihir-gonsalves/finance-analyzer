// frontend/src/components/AnalyticsPanel.tsx
import { useState } from "react";
import { Card, CardContent, Box, Button, Skeleton } from "@mui/material";
import { DonutLarge, Category as CategoryIcon, Assessment } from "@mui/icons-material";
import { useFilteredTransactions } from "../hooks/useTransactions";
import { useSpendingAnalytics } from "../hooks/useSpendingAnalytics";
import { SpendingOverview } from "./analytics/SpendingOverview";
import { TopCategoriesList } from "./analytics/TopCategoriesList";
import { QuickStatsView } from "./analytics/QuickStatsView";
import type { TransactionFilters } from "../types/filters";

type ViewMode = 'overview' | 'categories' | 'stats';

interface AnalyticsPanelProps {
  filters: TransactionFilters;
}

const VIEW_CONFIG = {
  overview: { icon: DonutLarge, title: 'Spending Overview', next: 'categories' as ViewMode },
  categories: { icon: CategoryIcon, title: 'Top Categories', next: 'stats' as ViewMode },
  stats: { icon: Assessment, title: 'Quick Stats', next: 'overview' as ViewMode },
};

export default function AnalyticsPanel({ filters }: AnalyticsPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const { data: filteredTransactions = [], isLoading } = useFilteredTransactions(filters);
  const analytics = useSpendingAnalytics(filteredTransactions);

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
    <Card sx={{ height: 653 }}>
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
              chartData={analytics.chartData} 
              totalSpent={analytics.totalSpent} 
            />
          )}
          {viewMode === 'categories' && (
            <TopCategoriesList 
              categories={analytics.chartData}
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