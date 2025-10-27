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
import { layoutStyles, commonStyles } from "../styles";
import type { TransactionFilters } from "../types/filters";


export type { TransactionFilters };


interface FiltersPanelProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClose: () => void;
}


export default function FiltersPanel({ filters, onFiltersChange, onClose }: FiltersPanelProps) {
  const { spend_categories, cost_centers, accounts } = useFilterOptions();
  const { pendingFilters, updateFilter, reset, hasUnsavedChanges } = usePendingFilters(filters);
  const [validationError, setValidationError] = useState<string>("");

  const handleApply = () => {
    const sanitized = sanitizeFilters(pendingFilters);
    const validation = validateFilters(sanitized);

    if (!validation.isValid) {
      setValidationError(getValidationErrorMessage(validation));
      return;
    }

    setValidationError("");
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
    <Card sx={{ ...commonStyles.card.elevated, mb: 1}}>
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

        <Box sx={layoutStyles.filterPanel.container}>
          {/* Search and Date Range Row */}
          <Box sx={layoutStyles.filterPanel.row}>
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
          <Box sx={layoutStyles.filterPanel.row}>
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
          <Box sx={layoutStyles.grid.twoColumn}>
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
