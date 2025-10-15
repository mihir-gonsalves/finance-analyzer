// frontend/src/components/transactions/FilterTags.tsx
import { Box, Chip } from "@mui/material";
import { AccountBalance, Category, CalendarMonth } from "@mui/icons-material";
import { formatDateString } from "../../utils/dateUtils";
import type { TransactionFilters } from "../../types/filters";

interface FilterTagsProps {
  filters: TransactionFilters;
}

export function FilterTags({ filters }: FilterTagsProps) {
  const tags = [];

  if (filters.accounts.length > 0) {
    tags.push(
      <Chip
        key="accounts"
        icon={<AccountBalance />}
        label={filters.accounts.length === 1 ? filters.accounts[0] : `${filters.accounts.length} accounts`}
      />
    );
  }

  if (filters.categories.length > 0) {
    tags.push(
      <Chip
        key="categories"
        icon={<Category />}
        label={filters.categories.length === 1 ? filters.categories[0] : `${filters.categories.length} categories`}
      />
    );
  }

  if (filters.dateFrom || filters.dateTo) {
    const formattedDateFrom = filters.dateFrom ? formatDateString(filters.dateFrom) : '...';
    const formattedDateTo = filters.dateTo ? formatDateString(filters.dateTo) : '...';
    
    tags.push(
      <Chip
        key="dates"
        icon={<CalendarMonth />}
        label={`Dates: ${formattedDateFrom} to ${formattedDateTo}`}
      />
    );
  }

  if (filters.searchTerm) {
    tags.push(
      <Chip
        key="search"
        label={`Description: "${filters.searchTerm}"`}
      />
    );
  }

  if (filters.minAmount || filters.maxAmount) {
    tags.push(
      <Chip
        key="amount"
        label={`Amount: $${filters.minAmount || '...'} to $${filters.maxAmount || '...'}`}
      />
    );
  }

  if (tags.length === 0) return null;

  return (
    <Box display="flex" flexWrap="wrap" alignItems="center" gap={1.5} >
      {tags}
    </Box>
  );
}