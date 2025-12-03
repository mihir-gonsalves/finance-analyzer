// frontend/src/hooks/useFilters.ts - smart hook that switches between all/filtered transactions based on active filters
import type { TransactionFilters } from "../types/filters";
import { hasActiveFilters } from "../utils/filterUtils";
import { useTransactions, useFilteredTransactions } from "./useTransactions";

// ========================
// HOOK
// ========================

/**
 * Smart hook that returns all transactions if no filters are applied,
 * otherwise returns filtered transactions
 * 
 * This avoids unnecessary filtered queries when no filters are active
 */
export function useFilteredOrAllTransactions(filters: TransactionFilters) {
  const hasFilters = hasActiveFilters(filters);

  const allTransactionsQuery = useTransactions();
  const filteredTransactionsQuery = useFilteredTransactions(filters);

  // Return the appropriate query result
  return hasFilters ? filteredTransactionsQuery : allTransactionsQuery;
}
