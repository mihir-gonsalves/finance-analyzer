// frontend/src/utils/filterUtils.ts - filter operations (equality checks, URL param building, active filter counting)
import type { TransactionFilters } from '../types/filters';


/*
 * Count how many filters are currently active
 */
export function getActiveFilterCount(filters: TransactionFilters): number {
  return Object.entries(filters).filter(([_, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '';
  }).length;
}


/*
 * Check if any filters are currently active
 */
export function hasActiveFilters(filters: TransactionFilters): boolean {
  return getActiveFilterCount(filters) > 0;
}


/*
 * Create an empty filter object with all fields set to defaults
 */
export function createEmptyFilters(): TransactionFilters {
  return {
    dateFrom: '',
    dateTo: '',
    spend_category_ids: [],
    cost_center_ids: [],
    accounts: [],
    minAmount: '',
    maxAmount: '',
    searchTerm: '',
  };
}


/*
 * Deep equality check for filters
 */
export function areFiltersEqual(a: TransactionFilters, b: TransactionFilters): boolean {
  // Compare primitive values
  if (
    a.dateFrom !== b.dateFrom ||
    a.dateTo !== b.dateTo ||
    a.minAmount !== b.minAmount ||
    a.maxAmount !== b.maxAmount ||
    a.searchTerm !== b.searchTerm
  ) {
    return false;
  }

  // Compare arrays
  return (
    areNumberArraysEqual(a.spend_category_ids, b.spend_category_ids) &&
    areNumberArraysEqual(a.cost_center_ids, b.cost_center_ids) &&
    areStringArraysEqual(a.accounts, b.accounts)
  );
}


function areStringArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}


function areNumberArraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((val, idx) => val === sortedB[idx]);
}


/*
 * Build URL search params for backend filtering endpoint
 * Maps frontend filter format to backend query parameters
 * 
 * Backend expects:
 * - account: string[] (query param repeated for each account)
 * - spend_category_ids: number[] (query param repeated)
 * - cost_center_ids: number[] (query param repeated)
 * - start: string (YYYY-MM-DD)
 * - end: string (YYYY-MM-DD)
 * - min_amount: number
 * - max_amount: number
 * - search: string
 */
export function buildFilterParams(filters: TransactionFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Array filters - append each value separately
  filters.accounts.forEach(account => {
    if (account.trim()) {
      params.append('account', account);
    }
  });

  filters.spend_category_ids.forEach(id => {
    params.append('spend_category_ids', id.toString());
  });

  filters.cost_center_ids.forEach(id => {
    params.append('cost_center_ids', id.toString());
  });

  // Date filters (YYYY-MM-DD format expected)
  if (filters.dateFrom) {
    params.append('start', filters.dateFrom);
  }
  if (filters.dateTo) {
    params.append('end', filters.dateTo);
  }

  // Amount filters (convert to numbers)
  if (filters.minAmount) {
    const minAmount = parseFloat(filters.minAmount);
    if (!isNaN(minAmount)) {
      params.append('min_amount', minAmount.toString());
    }
  }
  if (filters.maxAmount) {
    const maxAmount = parseFloat(filters.maxAmount);
    if (!isNaN(maxAmount)) {
      params.append('max_amount', maxAmount.toString());
    }
  }

  // Search filter
  if (filters.searchTerm) {
    params.append('search', filters.searchTerm);
  }

  // Default sorting (can be overridden by component)
  params.append('sort_by', 'date');
  params.append('sort_order', 'desc');

  return params;
}
