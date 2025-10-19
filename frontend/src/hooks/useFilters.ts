// frontend/src/hooks/useFilteredOrAllTransactions.ts
import type { TransactionFilters } from "../types/filters";
import { hasActiveFilters } from "../utils/filterUtils";
import { useTransactions, useFilteredTransactions } from "./useTransactions";

/**
 * Smart hook that returns all transactions if no filters are applied,
 * otherwise returns filtered transactions
 */
export function useFilteredOrAllTransactions(filters: TransactionFilters) {
  const hasFilters = hasActiveFilters(filters);

  // Fetch all transactions if no filters are active
  const allTransactionsQuery = useTransactions();

  // Fetch filtered transactions only if filters are active
  const filteredTransactionsQuery = useFilteredTransactions(filters);

  // Return the appropriate query result
  if (hasFilters) {
    return filteredTransactionsQuery;
  }

  return allTransactionsQuery;
}