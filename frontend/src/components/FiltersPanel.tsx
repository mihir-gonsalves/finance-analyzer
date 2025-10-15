// frontend/src/components/FiltersPanel.tsx
import { Card, CardContent, Box, Divider } from "@mui/material";
import { useTransactions } from "../hooks/useTransactions";
import { useFilterOptions } from "../hooks/useFilterOptions";
import { usePendingFilters } from "../hooks/usePendingFilters";
import { getActiveFilterCount, hasActiveFilters, createEmptyFilters } from "../utils/filterUtils";
import { FiltersPanelHeader } from "./filters/FiltersPanelHeader";
import { SearchFilter } from "./filters/SearchFilter";
import { DateRangeFilter } from "./filters/DateRangeFilter";
import { CategoryFilter } from "./filters/CategoryFilter";
import { AccountFilter } from "./filters/AccountFilter";
import { AmountRangeFilter } from "./filters/AmountRangeFilter";
import { FilterActions } from "./filters/FilterActions";
import type { TransactionFilters } from "../types/filters";

export type { TransactionFilters };

interface FiltersPanelProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClose: () => void;
}

export default function FiltersPanel({ 
  filters, 
  onFiltersChange, 
  onClose 
}: FiltersPanelProps) {
  const { data: transactions = [] } = useTransactions();
  const { categories, accounts } = useFilterOptions(transactions);
  const { pendingFilters, updateFilter, reset, hasUnsavedChanges } = usePendingFilters(filters);

  const handleApply = () => {
    onFiltersChange(pendingFilters);
  };

  const handleClearAll = () => {
    const emptyFilters = createEmptyFilters();
    onFiltersChange(emptyFilters);
  };

  const activeFilterCount = getActiveFilterCount(filters);
  const hasFilters = hasActiveFilters(filters);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <FiltersPanelHeader
          activeFilterCount={activeFilterCount}
          hasActiveFilters={hasFilters}
          onClearAll={handleClearAll}
          onClose={onClose}
        />

        <Divider sx={{ mb: 3 }} />

        <Box display="flex" flexDirection="column" gap={3}>
          {/* Search and Date Range Row */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }}
            gap={2}
          >
            <SearchFilter
              value={pendingFilters.searchTerm}
              onChange={(value) => updateFilter('searchTerm', value)}
            />
            <DateRangeFilter
              dateFrom={pendingFilters.dateFrom}
              dateTo={pendingFilters.dateTo}
              onDateFromChange={(value) => updateFilter('dateFrom', value)}
              onDateToChange={(value) => updateFilter('dateTo', value)}
            />
          </Box>

          {/* Categories and Accounts Row */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
            gap={2}
          >
            <CategoryFilter
              value={pendingFilters.categories}
              options={categories}
              onChange={(value) => updateFilter('categories', value)}
            />
            <AccountFilter
              value={pendingFilters.accounts}
              options={accounts}
              onChange={(value) => updateFilter('accounts', value)}
            />
          </Box>

          {/* Amount Range Row */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
            gap={2}
          >
            <AmountRangeFilter
              minAmount={pendingFilters.minAmount}
              maxAmount={pendingFilters.maxAmount}
              onMinAmountChange={(value) => updateFilter('minAmount', value)}
              onMaxAmountChange={(value) => updateFilter('maxAmount', value)}
            />
          </Box>

          {/* Actions Row */}
          <FilterActions
            hasUnsavedChanges={hasUnsavedChanges}
            onReset={reset}
            onApply={handleApply}
          />
        </Box>
      </CardContent>
    </Card>
  );
}