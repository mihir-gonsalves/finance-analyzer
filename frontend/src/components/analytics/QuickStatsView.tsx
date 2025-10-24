// frontend/src/components/analytics/QuickStatsView.tsx - quick statistics (count, averages, totals)
import { Box, Typography, Divider } from "@mui/material";
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, AccountBalance as BalanceIcon } from "@mui/icons-material";
import { formatCurrency } from "../../utils/analyticsUtils";
import type { SpendingAnalytics } from "../../hooks/useSpendingAnalytics";


interface QuickStatsViewProps {
  analytics: SpendingAnalytics;
}


export function QuickStatsView({ analytics }: QuickStatsViewProps) {
  const { totalIncome, totalSpent, netBalance, stats } = analytics;

  return (
    <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 0.5 }}>
      {/* Primary Financial Stats */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 2.5,
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: 'success.light',
          bgcolor: 'success.50',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUpIcon sx={{ color: 'success.dark', fontSize: 24 }} />
          <Typography color="success.dark" variant="h6" fontWeight="600">
            Total Income
          </Typography>
        </Box>
        <Typography
          fontWeight="700"
          color="success.main"
          variant="h5"
        >
          {formatCurrency(totalIncome)}
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 2.5,
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: 'error.light',
          bgcolor: 'error.50',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingDownIcon sx={{ color: 'error.dark', fontSize: 24 }} />
          <Typography color="error.dark" variant="h6" fontWeight="600">
            Total Spent
          </Typography>
        </Box>
        <Typography
          fontWeight="700"
          color="error.main"
          variant="h5"
        >
          {formatCurrency(totalSpent)}
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 2.5,
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: netBalance >= 0 ? 'success.light' : 'error.light',
          bgcolor: netBalance >= 0 ? 'success.50' : 'error.50',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <BalanceIcon
            sx={{
              color: netBalance >= 0 ? 'success.dark' : 'error.dark',
              fontSize: 24
            }}
          />
          <Typography
            color={netBalance >= 0 ? 'success.dark' : 'error.dark'}
            variant="h6"
            fontWeight="600"
          >
            Net Balance
          </Typography>
        </Box>
        <Typography
          fontWeight="700"
          color={netBalance >= 0 ? 'success.main' : 'error.main'}
          variant="h5"
        >
          {netBalance >= 0 ? '+' : ''}
          {formatCurrency(netBalance)}
        </Typography>
      </Box>

      <Divider sx={{ my: 0.5 }} />

      {/* Secondary Stats */}
      <Box display="flex" flexDirection="column" gap={2.5}>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
          <Typography color="text.secondary" variant="body1" fontWeight="500">
            Avg. Paycheck
          </Typography>
          <Typography fontWeight="600" variant="h6" color="success.main">
            {formatCurrency(stats.avgPerPaycheck)}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
          <Typography color="text.secondary" variant="body1" fontWeight="500">
            Avg. Expense
          </Typography>
          <Typography fontWeight="600" variant="h6" color="error.main">
            {formatCurrency(stats.avgPerExpense)}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
          <Typography color="text.secondary" variant="body1" fontWeight="500">
            Paychecks
          </Typography>
          <Typography fontWeight="600" variant="h6">
            {stats.paycheckCount}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
          <Typography color="text.secondary" variant="body1" fontWeight="500">
            Expenses
          </Typography>
          <Typography fontWeight="600" variant="h6">
            {stats.expenseCount}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
