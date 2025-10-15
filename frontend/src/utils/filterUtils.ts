// frontend/src/utils/filterUtils.ts
import type { TransactionFilters } from '../types/filters';

export function getActiveFilterCount(filters: TransactionFilters): number {
  return Object.entries(filters).filter(([key, value]) => {
    if (key === 'categories' || key === 'accounts') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== '';
  }).length;
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return getActiveFilterCount(filters) > 0;
}

export function createEmptyFilters(): TransactionFilters {
  return {
    dateFrom: '',
    dateTo: '',
    categories: [],
    accounts: [],
    minAmount: '',
    maxAmount: '',
    searchTerm: '',
  };
}

