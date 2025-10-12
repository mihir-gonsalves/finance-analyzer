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
            bgcolor: netBalance >= 0 ? 'success.50' : 'error.50', 
            borderRadius: 2,
            border: '2px solid',
            borderColor: netBalance >= 0 ? 'success.200' : 'error.200'
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
        
        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
            <Typography color="text.secondary" variant="body1" fontWeight="500">
              Transactions
            </Typography>
            <Typography fontWeight="600" variant="h6">
              {stats.transactionCount}
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
          
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
            <Typography color="text.secondary" variant="body1" fontWeight="500">
              Avg per Expense
            </Typography>
            <Typography fontWeight="600" variant="h6">
              {formatCurrency(stats.avgPerExpense)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}