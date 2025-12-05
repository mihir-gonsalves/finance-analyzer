// frontend/src/components/analytics/QuickStatsView.tsx
import { Box, Typography, Divider } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Balance as BalanceIcon,
} from "@mui/icons-material";
import { formatCurrency } from "../../utils/analyticsUtils";
import { commonStyles, layoutStyles, combineStyles } from "../../styles";
import { SPACING } from "../../styles/constants";
import type { SpendingAnalytics } from "../../hooks/useSpendingAnalytics";

// ========================
// TYPE DEFINITIONS
// ========================

interface QuickStatsViewProps {
  analytics: SpendingAnalytics;
}

type StatType = 'positive' | 'negative' | 'neutral';

interface StatCardConfig {
  icon: typeof TrendingUpIcon;
  label: string;
  value: number;
  type: StatType;
}

interface StatRowConfig {
  label: string;
  value: string | number;
  color?: string;
}

// ========================
// CONSTANTS
// ========================

const ICON_SIZE = 24;

// ========================
// UTILITY FUNCTIONS
// ========================

const getStatCardColor = (type: StatType) => {
  switch (type) {
    case 'positive':
      return 'success.dark';
    case 'negative':
      return 'error.dark';
    case 'neutral':
      return 'info.dark';
  }
};

const getStatCardStyle = (type: StatType) => {
  switch (type) {
    case 'positive':
      return commonStyles.statCard.success;
    case 'negative':
      return commonStyles.statCard.error;
    case 'neutral':
      return commonStyles.statCard.success;
  }
};

const getValueStyle = (type: StatType) => {
  switch (type) {
    case 'positive':
      return commonStyles.typography.valuePositive;
    case 'negative':
      return commonStyles.typography.valueNegative;
    case 'neutral':
      return commonStyles.typography.valueNeutral;
  }
};

const shouldShowPositiveSign = (type: StatType): boolean => {
  return type === 'positive';
};

// ========================
// SUB-COMPONENTS
// ========================

interface StatCardProps {
  icon: typeof TrendingUpIcon;
  label: string;
  value: number;
  type: StatType;
}

function StatCard({ icon: Icon, label, value, type }: StatCardProps) {
  const color = getStatCardColor(type);
  const cardStyle = getStatCardStyle(type);
  const valueStyle = getValueStyle(type);
  const showSign = shouldShowPositiveSign(type);

  return (
    <Box sx={combineStyles(commonStyles.statCard.base, cardStyle)}>
      {/* Icon and Label */}
      <Box sx={{ ...layoutStyles.flex.row, gap: 1.5 }}>
        <Icon sx={{ color, fontSize: ICON_SIZE }} />
        <Typography color={color} variant="h6" fontWeight="600">
          {label}
        </Typography>
      </Box>

      {/* Value */}
      <Typography variant="h5" sx={valueStyle}>
        {showSign && '+'}
        {formatCurrency(value)}
      </Typography>
    </Box>
  );
}

interface StatRowProps {
  label: string;
  value: string | number;
  color?: string;
}

function StatRow({ label, value, color = 'text.primary' }: StatRowProps) {
  return (
    <Box sx={layoutStyles.analytics.statRow}>
      <Typography sx={commonStyles.typography.label}>{label}</Typography>
      <Typography fontWeight="600" variant="h6" color={color}>
        {value}
      </Typography>
    </Box>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function QuickStatsView({ analytics }: QuickStatsViewProps) {
  const { totalIncome, totalSpent, netBalance, stats } = analytics;

  // Primary financial stats configuration
  const primaryStats: StatCardConfig[] = [
    {
      icon: TrendingUpIcon,
      label: 'Total Income',
      value: totalIncome,
      type: 'positive',
    },
    {
      icon: TrendingDownIcon,
      label: 'Total Spent',
      value: totalSpent,
      type: 'negative',
    },
    {
      icon: BalanceIcon,
      label: 'Net Balance',
      value: netBalance,
      type: netBalance >= 0 ? 'positive' : 'negative',
    },
  ];

  // Secondary stats configuration
  const secondaryStats: StatRowConfig[] = [
    {
      label: 'Avg. Paycheck',
      value: formatCurrency(stats.avgPerPaycheck),
      color: 'success.main',
    },
    {
      label: 'Avg. Expense',
      value: formatCurrency(stats.avgPerExpense),
      color: 'error.main',
    },
    {
      label: 'Paychecks',
      value: stats.paycheckCount,
    },
    {
      label: 'Expenses',
      value: stats.expenseCount,
    },
    {
      label: 'No. Cost Centers',
      value: stats.costCenterCount,
    },
    {
      label: 'No. Spend Categories',
      value: stats.spendCategoryCount,
    },
  ];

  return (
    <Box sx={{ ...layoutStyles.flex.column, gap: SPACING.md, mt: 1.2 }}>
      {/* Primary Financial Stats */}
      {primaryStats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          type={stat.type}
        />
      ))}

      <Divider sx={{ my: 0.5 }} />

      {/* Secondary Stats */}
      <Box sx={{ ...layoutStyles.flex.column, gap: 2.1 }}>
        {secondaryStats.map((stat, index) => (
          <StatRow
            key={index}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </Box>
    </Box>
  );
}
