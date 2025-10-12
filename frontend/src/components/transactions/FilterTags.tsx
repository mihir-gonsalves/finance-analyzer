// frontend/src/components/transactions/FilterTags.tsx
import { Box, Chip } from "@mui/material";
import { AccountBalance, Category, CalendarMonth } from "@mui/icons-material";
import type { FilterState } from "../../types/filters";

interface FilterTagsProps {
  filters: FilterState;
}

export function FilterTags({ filters }: FilterTagsProps) {
  const tags = [];

  if (filters.accounts.length > 0) {
    tags.push(
      <Chip
        key="accounts"
        icon={<AccountBalance />}
        label={filters.accounts.length === 1 ? filters.accounts[0] : `${filters.accounts.length} accounts`}
        size="small"
        color="primary"
        variant="outlined"
      />
    );
  }

  if (filters.categories.length > 0) {
    tags.push(
      <Chip
        key="categories"
        icon={<Category />}
        label={filters.categories.length === 1 ? filters.categories[0] : `${filters.categories.length} categories`}
        size="small"
        color="primary"
        variant="outlined"
      />
    );
  }

  if (filters.dateFrom || filters.dateTo) {
    tags.push(
      <Chip
        key="dates"
        icon={<CalendarMonth />}
        label={`Dates: ${filters.dateFrom || '...'} to ${filters.dateTo || '...'}`}
        size="small"
        color="primary"
        variant="outlined"
      />
    );
  }

  if (filters.searchTerm) {
    tags.push(
      <Chip
        key="search"
        label={`Description: "${filters.searchTerm}"`}
        size="small"
        color="primary"
        variant="outlined"
      />
    );
  }

  if (filters.minAmount || filters.maxAmount) {
    tags.push(
      <Chip
        key="amount"
        label={`Amount: $${filters.minAmount || '...'} to $${filters.maxAmount || '...'}`}
        size="small"
        color="primary"
        variant="outlined"
      />
    );
  }

  if (tags.length === 0) return null;

  return (
    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
      {tags}
    </Box>
  );
}