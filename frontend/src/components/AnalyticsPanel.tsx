// components/AnalyticsPanel.tsx
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Skeleton,
  useTheme,
  Button
} from "@mui/material";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { 
  TrendingDown, 
  Category as CategoryIcon, 
  Assessment,
  DonutLarge
} from "@mui/icons-material";

import { useFilteredTransactions } from "../hooks/useTransactions";
import type { FilterState } from "../types/filters";

interface CategoryData {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

interface AnalyticsPanelProps {
  filters: FilterState;
}

type ViewMode = 'overview' | 'categories' | 'stats';

export default function AnalyticsPanel({ filters }: AnalyticsPanelProps) {
  const theme = useTheme();
  const { data: filteredTransactions = [], isLoading } = useFilteredTransactions(filters);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  // Calculate spending by category using filtered data
  const categorySpending = filteredTransactions.reduce((acc, transaction) => {
    // Only count negative amounts (expenses) - parsers now ensure all expenses are negative
    if (transaction.amount >= 0) return acc;

    const amount = Math.abs(transaction.amount);

    // If transaction has no categories, count as "Uncategorized"
    if (transaction.categories.length === 0) {
      acc["Uncategorized"] = (acc["Uncategorized"] || 0) + amount;
      return acc;
    }

    // Add full amount to each category the transaction belongs to
    transaction.categories.forEach(category => {
      // Skip payments and credits - these are not spending categories
      if (category.name.toLowerCase().includes('payment') || category.name.toLowerCase().includes('credit')) {
        return;
      }

      // Each category gets the full transaction amount attributed to it
      acc[category.name] = (acc[category.name] || 0) + amount;
    });

    return acc;
  }, {} as Record<string, number>);


  // Convert to chart data
  const chartData: CategoryData[] = Object.entries(categorySpending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Top 5 categories
  const topCategories = chartData.slice(0, 5);

  // Total spent
  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Total income (positive amounts) from filtered data
  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Colors aligned with theme
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.grey[600],
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalSpent) * 100).toFixed(1);
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            position: 'relative',
          }}
        >
          <Typography variant="body2" fontWeight="600" gutterBottom>
            {data.payload.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(data.value)} ({percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const getViewIcon = () => {
    switch (viewMode) {
      case 'overview': return <DonutLarge />;
      case 'categories': return <CategoryIcon />;
      case 'stats': return <Assessment />;
    }
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'overview': return 'Spending Overview';
      case 'categories': return 'Top Categories';
      case 'stats': return 'Quick Stats';
    }
  };

  const cycleView = () => {
    setViewMode(prev => {
      switch (prev) {
        case 'overview': return 'categories';
        case 'categories': return 'stats';
        case 'stats': return 'overview';
        default: return 'overview';
      }
    });
  };

  const LoadingSkeleton = () => (
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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const renderSpendingOverview = () => (
    <Box 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center"
      sx={{ height: '520px' }}
    >
      {chartData.length === 0 ? (
        <Box textAlign="center">
          <CategoryIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
          <Typography color="text.secondary" variant="body2">
            No spending data available
          </Typography>
        </Box>
      ) : (
        <Box position="relative" height="100%" width="100%" sx={{ '& .recharts-tooltip-wrapper': { zIndex: 9999 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={140}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Total in center */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            sx={{
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <Typography 
              variant="h4" 
              fontWeight="700" 
              color="primary.main"
              sx={{ letterSpacing: '-0.02em' }}
            >
              {formatCurrency(totalSpent)}
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              Total Spent
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderTopCategories = () => (
    <Box sx={{ height: '520px', overflow: 'auto' }}>
      {topCategories.length === 0 ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center" 
          height="100%"
        >
          <CategoryIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
          <Typography color="text.secondary" variant="body2">
            No categories available
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {chartData.map((category, index) => (
            <Box key={category.name}>
              <ListItem disableGutters sx={{ py: 2 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: COLORS[index % COLORS.length],
                    mr: 2,
                    flexShrink: 0,
                  }}
                />
                <ListItemText
                  primary={category.name}
                  secondary={`${((category.value / totalSpent) * 100).toFixed(1)}% of total spending`}
                  primaryTypographyProps={{ 
                    fontWeight: 600,
                    variant: 'body1'
                  }}
                  secondaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary'
                  }}
                />
                <Typography 
                  variant="h6" 
                  fontWeight="700"
                  color="text.primary"
                >
                  {formatCurrency(category.value)}
                </Typography>
              </ListItem>
              {index < chartData.length - 1 && (
                <Divider sx={{ ml: 4 }} />
              )}
            </Box>
          ))}
        </List>
      )}
    </Box>
  );

  const renderQuickStats = () => (
    <Box 
      display="flex" 
      flexDirection="column" 
      justifyContent="center"
      sx={{ height: '620px' }}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ 
            p: 3, 
            bgcolor: 'success.50', 
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'success.200'
          }}
        >
          <Typography color="success.dark" variant="h6" fontWeight="600">
            Total Income
          </Typography>
          <Typography 
            fontWeight="700" 
            color="success.main"
            variant="h5"
          >
            +{formatCurrency(totalIncome)}
          </Typography>
        </Box>

        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ 
            p: 3, 
            bgcolor: 'error.50', 
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'error.200'
          }}
        >
          <Typography color="error.dark" variant="h6" fontWeight="600">
            Total Spent
          </Typography>
          <Typography 
            fontWeight="700" 
            color="error.main"
            variant="h5"
          >
            -{formatCurrency(totalSpent)}
          </Typography>
        </Box>

        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ 
            p: 3, 
            bgcolor: totalIncome - totalSpent >= 0 ? 'success.50' : 'error.50', 
            borderRadius: 2,
            border: '2px solid',
            borderColor: totalIncome - totalSpent >= 0 ? 'success.200' : 'error.200'
          }}
        >
          <Typography 
            color={totalIncome - totalSpent >= 0 ? 'success.dark' : 'error.dark'} 
            variant="h6" 
            fontWeight="600"
          >
            Net Balance
          </Typography>
          <Typography 
            fontWeight="700" 
            color={totalIncome - totalSpent >= 0 ? 'success.main' : 'error.main'}
            variant="h5"
          >
            {totalIncome - totalSpent >= 0 ? '+' : ''}
            {formatCurrency(totalIncome - totalSpent)}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
            <Typography color="text.secondary" variant="body1" fontWeight="500">
              Transactions
            </Typography>
            <Typography fontWeight="600" variant="h6">
              {filteredTransactions.length}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
            <Typography color="text.secondary" variant="body1" fontWeight="500">
              Categories
            </Typography>
            <Typography fontWeight="600" variant="h6">
              {Object.keys(categorySpending).length}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
            <Typography color="text.secondary" variant="body1" fontWeight="500">
              Avg per Expense
            </Typography>
            <Typography fontWeight="600" variant="h6">
              {(() => {
                // Count expense transactions using same logic as categorySpending
                const expenseCount = filteredTransactions.filter(transaction => {
                  if (transaction.amount >= 0) return false;

                  // Check if transaction has any non-payment/credit categories or is uncategorized
                  if (transaction.categories.length === 0) return true; // Uncategorized

                  return transaction.categories.some(cat =>
                    !cat.name.toLowerCase().includes('payment') && !cat.name.toLowerCase().includes('credit')
                  );
                }).length;

                return expenseCount > 0 ? formatCurrency(totalSpent / expenseCount) : '$0.00';
              })()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'overview': return renderSpendingOverview();
      case 'categories': return renderTopCategories();
      case 'stats': return renderQuickStats();
      default: return renderSpendingOverview();
    }
  };

  return (
    <Card sx={{ height: 694 }}>
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
            {getViewIcon()}
            {getViewTitle()}
          </Button>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {renderCurrentView()}
        </Box>
      </CardContent>
    </Card>
  );
}