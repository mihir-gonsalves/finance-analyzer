// frontend/src/components/FiltersPanel.tsx - filter controls for transactions (dates, categories, amounts, search)
import { Card, CardContent, Box, Divider, Alert } from "@mui/material";
import { useState } from "react";
import { useFilterOptions } from "../hooks/useFilterOptions";
import { usePendingFilters } from "../hooks/usePendingFilters";
import { getActiveFilterCount, hasActiveFilters, createEmptyFilters } from "../utils/filterUtils";
import { validateFilters, sanitizeFilters, getValidationErrorMessage } from "../utils/filterValidation"
import { FiltersPanelHeader } from "./filters/FiltersPanelHeader";
import { SearchFilter } from "./filters/SearchFilter";
import { DateRangeFilter } from "./filters/DateRangeFilter";
import { SpendCategoryFilter } from "./filters/SpendCategoryFilter";
import { CostCenterFilter } from "./filters/CostCenterFilter";
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

export default function FiltersPanel({ filters, onFiltersChange, onClose }: FiltersPanelProps) {
  // FIXED: useFilterOptions doesn't take any arguments
  const { spend_categories, cost_centers, accounts } = useFilterOptions();
  const { pendingFilters, updateFilter, reset, hasUnsavedChanges } = usePendingFilters(filters);

  const [validationError, setValidationError] = useState<string>("");

  const handleApply = () => {
    // Sanitize filters first
    const sanitized = sanitizeFilters(pendingFilters);

    // Validate filters
    const validation = validateFilters(sanitized);

    if (!validation.isValid) {
      setValidationError(getValidationErrorMessage(validation));
      return;
    }

    // Clear any previous errors
    setValidationError("");

    // Apply filters
    onFiltersChange(sanitized);
  };

  const handleClearAll = () => {
    const emptyFilters = createEmptyFilters();
    onFiltersChange(emptyFilters);
    setValidationError("");
  };

  const handleReset = () => {
    reset();
    setValidationError("");
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

        {validationError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setValidationError("")}>
            {validationError}
          </Alert>
        )}

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

          {/* Cost Centers, Spend Categories and Accounts Row */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }}
            gap={2}
          >
            <CostCenterFilter
              value={pendingFilters.cost_center_ids}
              options={cost_centers}
              onChange={(value) => updateFilter('cost_center_ids', value)}
            />
            <SpendCategoryFilter
              value={pendingFilters.spend_category_ids}
              options={spend_categories}
              onChange={(value) => updateFilter('spend_category_ids', value)}
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
            onReset={handleReset}
            onApply={handleApply}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
