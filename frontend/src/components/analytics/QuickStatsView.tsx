// frontend/src/components/analytics/QuickStatsView.tsx - quick statistics (count, averages, totals)
import { Box, Typography, Divider } from "@mui/material";
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Balance as BalanceIcon } from "@mui/icons-material";
import { formatCurrency } from "../../utils/analyticsUtils";
import { commonStyles, layoutStyles, combineStyles, conditionalStyle } from "../../styles";
import type { SpendingAnalytics } from "../../hooks/useSpendingAnalytics";


interface QuickStatsViewProps {
  analytics: SpendingAnalytics;
}


export function QuickStatsView({ analytics }: QuickStatsViewProps) {
  const { totalIncome, totalSpent, netBalance, stats } = analytics;

  // Stat card component
  const StatCard = ({
    icon: Icon,
    label,
    value,
    isPositive
  }: {
    icon: typeof TrendingUpIcon;
    label: string;
    value: number;
    isPositive?: boolean;
  }) => (
    <Box
      sx={combineStyles(
        commonStyles.statCard.base,
        isPositive === true ? commonStyles.statCard.success :
          isPositive === false ? commonStyles.statCard.error :
            commonStyles.statCard.info
      )}
    >
      <Box sx={{ ...layoutStyles.flex.row, gap: 1.5 }}>
        <Icon sx={{
          color: isPositive === true ? 'success.dark' :
            isPositive === false ? 'error.dark' :
              'info.dark',
          fontSize: 24
        }} />
        <Typography
          color={
            isPositive === true ? 'success.dark' :
              isPositive === false ? 'error.dark' :
                'info.dark'
          }
          variant="h6"
          fontWeight="600"
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant="h5"
        sx={conditionalStyle(
          isPositive === true,
          commonStyles.typography.valuePositive,
          isPositive === false ? commonStyles.typography.valueNegative : commonStyles.typography.valueNeutral
        )}
      >
        {isPositive === true && '+'}
        {formatCurrency(value)}
      </Typography>
    </Box>
  );

  // Secondary stat row component
  const StatRow = ({ label, value, color = 'text.primary' }: {
    label: string;
    value: string | number;
    color?: string;
  }) => (
    <Box sx={layoutStyles.analytics.statRow}>
      <Typography sx={commonStyles.typography.label}>
        {label}
      </Typography>
      <Typography
        fontWeight="600"
        variant="h6"
        color={color}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ ...layoutStyles.flex.column, gap: 2, mt: 1.2 }}>
      {/* Primary Financial Stats */}
      <StatCard
        icon={TrendingUpIcon}
        label="Total Income"
        value={totalIncome}
        isPositive={true}
      />

      <StatCard
        icon={TrendingDownIcon}
        label="Total Spent"
        value={totalSpent}
        isPositive={false}
      />

      <StatCard
        icon={BalanceIcon}
        label="Net Balance"
        value={netBalance}
        isPositive={netBalance >= 0}
      />

      <Divider sx={{ my: 0.5 }} />

      {/* Secondary Stats */}
      <Box sx={{ ...layoutStyles.flex.column, gap: 2.1 }}>
        <StatRow
          label="Avg. Paycheck"
          value={formatCurrency(stats.avgPerPaycheck)}
          color="success.main"
        />

        <StatRow
          label="Avg. Expense"
          value={formatCurrency(stats.avgPerExpense)}
          color="error.main"
        />

        <StatRow
          label="Paychecks"
          value={stats.paycheckCount}
        />

        <StatRow
          label="Expenses"
          value={stats.expenseCount}
        />

        <StatRow
          label="No. Cost Centers"
          value={stats.costCenterCount}
        />

        <StatRow
          label="No. Spend Categories"
          value={stats.spendCategoryCount}
        />
      </Box>
    </Box>
  );
}
