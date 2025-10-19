// frontend/src/utils/filterUtils.ts
import type { TransactionFilters } from '../types/filters';


export function getActiveFilterCount(filters: TransactionFilters): number {
  return Object.entries(filters).filter(([_, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
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


// Deep equality check for filters
export function areFiltersEqual(a: TransactionFilters, b: TransactionFilters): boolean {
  // Compare primitive values
  if (a.dateFrom !== b.dateFrom ||
    a.dateTo !== b.dateTo ||
    a.minAmount !== b.minAmount ||
    a.maxAmount !== b.maxAmount ||
    a.searchTerm !== b.searchTerm) {
    return false;
  }

  // Compare arrays
  return areArraysEqual(a.categories, b.categories) &&
    areArraysEqual(a.accounts, b.accounts);
}


function areArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}


// Build URL params for backend filtering
export function buildFilterParams(filters: TransactionFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Array filters
  filters.accounts.forEach(account => params.append('account', account));
  filters.categories.forEach(category => {
    const catValue = category === 'Uncategorized' ? '' : category;
    params.append('category', catValue);
  });

  // Date filters
  if (filters.dateFrom) params.append('start', filters.dateFrom);
  if (filters.dateTo) params.append('end', filters.dateTo);

  // Amount filters
  if (filters.minAmount) params.append('minAmount', filters.minAmount);
  if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

  // Search filter
  if (filters.searchTerm) params.append('search', filters.searchTerm);

  return params;
}
