// components/FiltersPanel.tsx
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import {
  FilterList,
  Clear,
} from "@mui/icons-material";

import { useTransactions } from "../hooks/useTransactions";
import type { FilterState } from "../types/filters";

export type { FilterState };

interface FiltersPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose: () => void;
}

export default function FiltersPanel({ filters, onFiltersChange, onClose }: FiltersPanelProps) {

  // Pending filters state - these are modified before applying
  const [pendingFilters, setPendingFilters] = useState<FilterState>(filters);

  const { data: transactions = [] } = useTransactions();

  // Sync pending filters with applied filters when they change externally
  useEffect(() => {
    setPendingFilters(filters);
  }, [filters]);

  // Get unique values for filter options
  const { categories, accounts } = useMemo(() => {
    // Extract all category names from all transactions
    const allCategoryNames = transactions.flatMap(t =>
      t.categories ? t.categories.map(cat => cat.name) : []
    );

    const uniqueCategories = Array.from(new Set(allCategoryNames)).sort();

    const uniqueAccounts = Array.from(
      new Set(transactions.map(t => t.account).filter(Boolean))
    ).sort();

    return {
      categories: uniqueCategories,
      accounts: uniqueAccounts,
    };
  }, [transactions]);

  const handleFilterChange = useCallback((field: keyof FilterState, value: string | string[]) => {
    setPendingFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const applyFilters = useCallback(() => {
    onFiltersChange(pendingFilters);
  }, [onFiltersChange, pendingFilters]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters = {
      dateFrom: '',
      dateTo: '',
      categories: [] as string[],
      accounts: [] as string[],
      minAmount: '',
      maxAmount: '',
      searchTerm: '',
    };
    setPendingFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'categories' || key === 'accounts') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== '';
  });

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'categories' || key === 'accounts') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== '';
  }).length;

  const hasUnsavedChanges = JSON.stringify(filters) !== JSON.stringify(pendingFilters);

  const FilterControls = useMemo(() => (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* First Row - Search and Date Range */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }}
        gap={2}
      >
        <TextField
          label="Search descriptions"
          value={pendingFilters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          size="small"
          fullWidth
        />

        <TextField
          label="From Date"
          type="date"
          value={pendingFilters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />

        <TextField
          label="To Date"
          type="date"
          value={pendingFilters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Box>

      {/* Second Row - Categories and Accounts */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
        gap={2}
      >
        <FormControl size="small" fullWidth>
          <InputLabel>Categories</InputLabel>
          <Select
            multiple
            value={pendingFilters.categories}
            label="Categories"
            onChange={(e) => handleFilterChange('categories', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            renderValue={(selected) =>
              selected.length === 0 ? 'All Categories' :
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            }
          >
            <MenuItem value="Uncategorized">Uncategorized</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Accounts</InputLabel>
          <Select
            multiple
            value={pendingFilters.accounts}
            label="Accounts"
            onChange={(e) => handleFilterChange('accounts', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            renderValue={(selected) =>
              selected.length === 0 ? 'All Accounts' :
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            }
          >
            {accounts.map((account) => (
              <MenuItem key={account} value={account}>
                {account}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Third Row - Amount Range */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
        gap={2}
      >
        <TextField
          label="Min Amount"
          type="number"
          value={pendingFilters.minAmount}
          onChange={(e) => handleFilterChange('minAmount', e.target.value)}
          size="small"
          helperText="Negative for expenses"
        />

        <TextField
          label="Max Amount"
          type="number"
          value={pendingFilters.maxAmount}
          onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
          size="small"
          helperText="Positive for income"
        />
      </Box>

      {/* Apply/Reset Button Row */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          onClick={() => setPendingFilters(filters)}
          disabled={!hasUnsavedChanges}
          variant="outlined"
          size="small"
        >
          Reset
        </Button>
        <Button
          onClick={applyFilters}
          disabled={!hasUnsavedChanges}
          variant="contained"
          size="small"
        >
          Apply Filters
        </Button>
      </Box>
    </Box>
  ), [pendingFilters, handleFilterChange, applyFilters, hasUnsavedChanges, categories, accounts]);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Filters
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                size="small"
                startIcon={<Clear />}
                color="error"
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Clear All
              </Button>
            )}

            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
            >
              <Clear />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Filter Controls */}
        {FilterControls}
      </CardContent>
    </Card>
  );
}