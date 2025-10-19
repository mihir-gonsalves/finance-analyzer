// frontend/src/components/analytics/QuickStatsView.tsx
import { Box, Typography, Divider } from "@mui/material";
import { formatCurrency } from "../../utils/analyticsUtils";
import type { SpendingAnalytics } from "../../hooks/useSpendingAnalytics";

interface QuickStatsViewProps {
  analytics: SpendingAnalytics;
}

export function QuickStatsView({ analytics }: QuickStatsViewProps) {
  const { totalIncome, totalSpent, netBalance, stats } = analytics;

  return (
    <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 0.5 }} >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 3,
          borderRadius: 1.5,
          border: '2px solid #cbd5e1',
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
          borderRadius: 1.5,
          border: '2px solid #cbd5e1',
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
          borderRadius: 1.5,
          border: '2px solid #cbd5e1',
        }}
      >
        <Typography
          color={netBalance >= 0 ? 'success.dark' : 'error.dark'}
          variant="h6"
          fontWeight="600"
        >
          Net Balance
        </Typography>
        <Typography
          fontWeight="700"
          color={netBalance >= 0 ? 'success.main' : 'error.main'}
          variant="h5"
        >
          {netBalance >= 0 ? '+' : ''}
          {formatCurrency(netBalance)}
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" flexDirection="column" gap={1} sx={{ my: -2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
          <Typography color="text.secondary" variant="body1" fontWeight="500">
            Average Paycheck Amount
          </Typography>
          <Typography fontWeight="600" variant="h6">
            {formatCurrency(stats.avgPerPaycheck)}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
          <Typography color="text.secondary" variant="body1" fontWeight="500">
            Average Expense Amount
          </Typography>
          <Typography fontWeight="600" variant="h6">
            {formatCurrency(stats.avgPerExpense)}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
          <Typography color="text.secondary" variant="body1" fontWeight="500">
            Categories
          </Typography>
          <Typography fontWeight="600" variant="h6">
            {stats.categoryCount}
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}