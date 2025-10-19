// frontend/src/components/transactions/FilterTags.tsx
import { Box, Chip } from "@mui/material";
import { AccountBalance, Category, CalendarMonth, Search, AttachMoney } from "@mui/icons-material";
import type { TransactionFilters } from "../../types/filters";
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
      key: 'categories',
      icon: <Category />,
      label: filters.categories.length === 1
        ? filters.categories[0]
        : `${filters.categories.length} categories`,
      condition: filters.categories.length > 0,
    },
    {
      key: 'dates',
      icon: <CalendarMonth />,
      label: `Dates: ${filters.dateFrom || '...'} to ${filters.dateTo || '...'}`,
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
      label: `$${filters.minAmount || '...'} to $${filters.maxAmount || '...'}`,
      condition: !!(filters.minAmount || filters.maxAmount),
    },
  ];

  const activeTags = tagConfigs.filter(config => config.condition);

  if (activeTags.length === 0) return null;

  return (
    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
      {activeTags.map(({ key, icon, label }) => (
        <Chip
          key={key}
          icon={icon}
          label={label}
          size="small"
          color="primary"
          variant="outlined"
          onDelete={onRemove ? () => onRemove(key as keyof TransactionFilters) : undefined}
        />
      ))}
    </Box>
  );
}
