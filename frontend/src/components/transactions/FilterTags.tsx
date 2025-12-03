// frontend/src/components/transactions/FilterTags.tsx
import { Box, Chip } from "@mui/material";
import {
  AccountBalance,
  Category,
  BusinessCenter,
  CalendarMonth,
  Search,
  AttachMoney,
} from "@mui/icons-material";
import { useSpendCategories, useCostCenters } from "../../hooks/useTransactions";
import type { TransactionFilters } from "../../types/filters";
import { formatDateString } from "../../utils/dateUtils";
import type { ReactElement } from "react";
import { layoutStyles, commonStyles } from "../../styles";

// ========================
// TYPE DEFINITIONS
// ========================

interface FilterTagsProps {
  filters: TransactionFilters;
  onRemove?: (filterKey: keyof TransactionFilters) => void;
}

interface TagConfig {
  key: string;
  icon: ReactElement;
  label: string;
  condition: boolean;
}

// ========================
// UTILITY FUNCTIONS
// ========================

const buildAccountsLabel = (accounts: string[]): string => {
  if (accounts.length === 1) return accounts[0];
  return `${accounts.length} accounts`;
};

const buildAmountLabel = (minAmount: string, maxAmount: string): string => {
  return `${minAmount || '...'} to ${maxAmount || '...'}`;
};

const buildDateLabel = (dateFrom: string, dateTo: string): string => {
  const from = formatDateString(dateFrom) || '...';
  const to = formatDateString(dateTo) || '...';
  return `Dates: ${from} to ${to}`;
};

const buildSearchLabel = (searchTerm: string): string => {
  return `"${searchTerm}"`;
};

// ========================
// MAIN COMPONENT
// ========================

export function FilterTags({ filters, onRemove }: FilterTagsProps) {
  const { data: spendCategoriesData } = useSpendCategories();
  const { data: costCentersData } = useCostCenters();

  const spendCategories = spendCategoriesData?.spend_categories || [];
  const costCenters = costCentersData?.cost_centers || [];

  // Build spend category label
  const getSpendCategoryLabel = (): string => {
    if (filters.spend_category_ids.length === 0) return '';

    if (filters.spend_category_ids.length === 1) {
      const cat = spendCategories.find(c => c.id === filters.spend_category_ids[0]);
      return cat?.name || 'Unknown';
    }

    return `${filters.spend_category_ids.length} spend categories`;
  };

  // Build cost center label
  const getCostCenterLabel = (): string => {
    if (filters.cost_center_ids.length === 0) return '';

    if (filters.cost_center_ids.length === 1) {
      const cc = costCenters.find(c => c.id === filters.cost_center_ids[0]);
      return cc?.name || 'Unknown';
    }

    return `${filters.cost_center_ids.length} cost centers`;
  };

  // Tag configurations
  const tagConfigs: TagConfig[] = [
    {
      key: 'accounts',
      icon: <AccountBalance />,
      label: buildAccountsLabel(filters.accounts),
      condition: filters.accounts.length > 0,
    },
    {
      key: 'cost_center_ids',
      icon: <BusinessCenter />,
      label: getCostCenterLabel(),
      condition: filters.cost_center_ids.length > 0,
    },
    {
      key: 'spend_category_ids',
      icon: <Category />,
      label: getSpendCategoryLabel(),
      condition: filters.spend_category_ids.length > 0,
    },
    {
      key: 'dates',
      icon: <CalendarMonth />,
      label: buildDateLabel(filters.dateFrom, filters.dateTo),
      condition: !!(filters.dateFrom || filters.dateTo),
    },
    {
      key: 'searchTerm',
      icon: <Search />,
      label: buildSearchLabel(filters.searchTerm),
      condition: !!filters.searchTerm,
    },
    {
      key: 'amount',
      icon: <AttachMoney />,
      label: buildAmountLabel(filters.minAmount, filters.maxAmount),
      condition: !!(filters.minAmount || filters.maxAmount),
    },
  ];

  // Filter to only active tags
  const activeTags = tagConfigs.filter(config => config.condition);

  if (activeTags.length === 0) return null;

  return (
    <Box sx={{ ...layoutStyles.flex.row, gap: 0.75, flexWrap: 'wrap' }}>
      {activeTags.map(({ key, icon, label }) => (
        <Chip
          key={key}
          icon={icon}
          label={label}
          onDelete={onRemove ? () => onRemove(key as keyof TransactionFilters) : undefined}
          sx={commonStyles.chip.filter}
        />
      ))}
    </Box>
  );
}
