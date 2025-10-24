// frontend/src/components/transactions/FilterTags.tsx - displays active filters as removable chips
import { Box, Chip } from "@mui/material";
import { AccountBalance, Category, Business, CalendarMonth, Search, AttachMoney } from "@mui/icons-material";
import { useSpendCategories, useCostCenters } from "../../hooks/useTransactions";
import type { TransactionFilters } from "../../types/filters";
import { formatDateString } from "../../utils/dateUtils";
import type { ReactElement } from "react";

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

export function FilterTags({ filters, onRemove }: FilterTagsProps) {
  const { data: spendCategoriesData } = useSpendCategories();
  const { data: costCentersData } = useCostCenters();

  // FIXED: Extract the arrays from the response objects
  const spendCategories = spendCategoriesData?.spend_categories || [];
  const costCenters = costCentersData?.cost_centers || [];

  // Helper to get spend category names from IDs
  const getSpendCategoryLabel = () => {
    if (filters.spend_category_ids.length === 0) return '';

    if (filters.spend_category_ids.length === 1) {
      const cat = spendCategories.find(c => c.id === filters.spend_category_ids[0]);
      return cat?.name || 'Unknown';
    }

    return `${filters.spend_category_ids.length} spend categories`;
  };

  // Helper to get cost center names from IDs
  const getCostCenterLabel = () => {
    if (filters.cost_center_ids.length === 0) return '';

    if (filters.cost_center_ids.length === 1) {
      const cc = costCenters.find(c => c.id === filters.cost_center_ids[0]);
      return cc?.name || 'Unknown';
    }

    return `${filters.cost_center_ids.length} cost centers`;
  };

  const tagConfigs: TagConfig[] = [
    {
      key: 'accounts',
      icon: <AccountBalance />,
      label: filters.accounts.length === 1
        ? filters.accounts[0]
        : `${filters.accounts.length} accounts`,
      condition: filters.accounts.length > 0,
    },
    {
      key: 'cost_center_ids',
      icon: <Business />,
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
      label: `Dates: ${formatDateString(filters.dateFrom) || '...'} to ${formatDateString(filters.dateTo) || '...'}`,
      condition: !!(filters.dateFrom || filters.dateTo),
    },
    {
      key: 'searchTerm',
      icon: <Search />,
      label: `"${filters.searchTerm}"`,
      condition: !!filters.searchTerm,
    },
    {
      key: 'amount',
      icon: <AttachMoney />,
      label: `${filters.minAmount || '...'} to ${filters.maxAmount || '...'}`,
      condition: !!(filters.minAmount || filters.maxAmount),
    },
  ];

  const activeTags = tagConfigs.filter(config => config.condition);

  if (activeTags.length === 0) return null;

  return (
    <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
      {activeTags.map(({ key, icon, label }) => (
        <Chip
          key={key}
          icon={icon}
          label={label}
          onDelete={onRemove ? () => onRemove(key as keyof TransactionFilters) : undefined}
        />
      ))}
    </Box>
  );
}
