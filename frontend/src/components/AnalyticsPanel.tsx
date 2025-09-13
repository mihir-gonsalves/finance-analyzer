import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, Divider } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { useTransactions } from "../hooks/useTransactions";

export default function AnalyticsPanel() {
  const { data: transactions = [] } = useTransactions();

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
  const chartData = Object.entries(categorySpending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Top 5 categories
  const topCategories = chartData.slice(0, 5);

  // Total spent
  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);

  // Colors for the pie chart
  const COLORS = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0', '#00695c', '#d32f2f'];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalSpent) * 100).toFixed(1);
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight="medium">
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

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Spending Overview Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Spending Overview
          </Typography>
          
          {chartData.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No spending data available
              </Typography>
            </Box>
          ) : (
            <Box position="relative" height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatCurrency(totalSpent)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
          <Typography variant="h6" gutterBottom>
            Top Categories
          </Typography>
          
          {topCategories.length === 0 ? (
            <Typography color="text.secondary">
              No categories available
            </Typography>
          ) : (
            <List disablePadding>
              {topCategories.map((category, index) => (
                <Box key={category.name}>
                  <ListItem disableGutters>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLORS[index % COLORS.length],
                        mr: 1.5,
                        flexShrink: 0,
                      }}
                    />
                    <ListItemText
                      primary={category.name}
                      secondary={`${((category.value / totalSpent) * 100).toFixed(1)}%`}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(category.value)}
                    </Typography>
                  </ListItem>
                  {index < topCategories.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Stats
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography color="text.secondary">Total Transactions:</Typography>
              <Typography fontWeight="medium">{transactions.length}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <Typography color="text.secondary">Categories:</Typography>
              <Typography fontWeight="medium">{Object.keys(categorySpending).length}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <Typography color="text.secondary">Avg per Transaction:</Typography>
              <Typography fontWeight="medium">
                {transactions.length > 0 
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