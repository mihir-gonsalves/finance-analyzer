// components/AnalyticsPanel.tsx
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
  useTheme
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
  Assessment 
} from "@mui/icons-material";

import { useTransactions } from "../hooks/useTransactions";

interface CategoryData {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

export default function AnalyticsPanel() {
  const theme = useTheme();
  const { data: transactions = [], isLoading } = useTransactions();

  // Calculate spending by category
  const categorySpending = transactions.reduce((acc, transaction) => {
    // Only count negative amounts (expenses)
    if (transaction.amount >= 0) return acc;
    
    const category = transaction.category || "Uncategorized";
    const amount = Math.abs(transaction.amount);
    
    acc[category] = (acc[category] || 0) + amount;
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
  
  // Total income (positive amounts)
  const totalIncome = transactions
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

  const LoadingSkeleton = () => (
    <Box display="flex" flexDirection="column" gap={3}>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Spending Overview Chart */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TrendingDown sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Spending Overview
            </Typography>
          </Box>
          
          {chartData.length === 0 ? (
            <Box textAlign="center" py={6}>
              <CategoryIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
              <Typography color="text.secondary" variant="body2">
                No spending data available
              </Typography>
            </Box>
          ) : (
            <Box position="relative" height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
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
                }}
              >
                <Typography 
                  variant="h5" 
                  fontWeight="700" 
                  color="primary.main"
                  sx={{ letterSpacing: '-0.02em' }}
                >
                  {formatCurrency(totalSpent)}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Total Spent
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <CategoryIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Top Categories
            </Typography>
          </Box>
          
          {topCategories.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography color="text.secondary" variant="body2">
                No categories available
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {topCategories.map((category, index) => (
                <Box key={category.name}>
                  <ListItem disableGutters sx={{ py: 1.5 }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: COLORS[index % COLORS.length],
                        mr: 2,
                        flexShrink: 0,
                      }}
                    />
                    <ListItemText
                      primary={category.name}
                      secondary={`${((category.value / totalSpent) * 100).toFixed(1)}%`}
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                        variant: 'body2'
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      fontWeight="600"
                      color="text.primary"
                    >
                      {formatCurrency(category.value)}
                    </Typography>
                  </ListItem>
                  {index < topCategories.length - 1 && (
                    <Divider sx={{ ml: 4 }} />
                  )}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Assessment sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Quick Stats
            </Typography>
          </Box>
          
          <Box display="flex" flexDirection="column" gap={2}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography color="text.secondary" variant="body2" fontWeight="500">
                Total Income
              </Typography>
              <Typography 
                fontWeight="600" 
                color="success.main"
                variant="body1"
              >
                +{formatCurrency(totalIncome)}
              </Typography>
            </Box>

            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography color="text.secondary" variant="body2" fontWeight="500">
                Net Balance
              </Typography>
              <Typography 
                fontWeight="600" 
                color={totalIncome - totalSpent >= 0 ? 'success.main' : 'error.main'}
                variant="body1"
              >
                {totalIncome - totalSpent >= 0 ? '+' : ''}
                {formatCurrency(totalIncome - totalSpent)}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary" variant="body2">
                Transactions
              </Typography>
              <Typography fontWeight="500" variant="body2">
                {transactions.length}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary" variant="body2">
                Categories
              </Typography>
              <Typography fontWeight="500" variant="body2">
                {Object.keys(categorySpending).length}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary" variant="body2">
                Avg per Expense
              </Typography>
              <Typography fontWeight="500" variant="body2">
                {transactions.filter(t => t.amount < 0).length > 0 
                  ? formatCurrency(totalSpent / transactions.filter(t => t.amount < 0).length)
                  : '$0.00'
                }
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}