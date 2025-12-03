// frontend/src/hooks/useFilterOptions.ts - fetches and prepares filter dropdown options from backend metadata
import { useMemo } from 'react';
import { useCostCenters, useSpendCategories, useAccounts } from './useTransactions';

// ========================
// TYPE DEFINITIONS
// ========================

export interface SpendCategoryOption {
  id: number;
  name: string;
}

export interface CostCenterOption {
  id: number;
  name: string;
}

export interface FilterOptions {
  spend_categories: SpendCategoryOption[];
  cost_centers: CostCenterOption[];
  accounts: string[];
  isLoading: boolean;
  error: Error | null;
}

// ========================
// HOOK
// ========================

/**
 * Fetch and prepare filter options from metadata endpoints
 * Handles loading states and errors from multiple queries
 */
export function useFilterOptions(): FilterOptions {
  const costCentersQuery = useCostCenters();
  const spendCategoriesQuery = useSpendCategories();
  const accountsQuery = useAccounts();

  return useMemo(() => {
    const isLoading =
      costCentersQuery.isLoading ||
      spendCategoriesQuery.isLoading ||
      accountsQuery.isLoading;

    const error =
      costCentersQuery.error ||
      spendCategoriesQuery.error ||
      accountsQuery.error;

    // Extract and sort cost centers
    const cost_centers = (costCentersQuery.data?.cost_centers || [])
      .map(cc => ({ id: cc.id, name: cc.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Extract and sort spend categories
    const spend_categories = (spendCategoriesQuery.data?.spend_categories || [])
      .map(sc => ({ id: sc.id, name: sc.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Accounts are already sorted from backend
    const accounts = accountsQuery.data || [];

    return {
      cost_centers,
      spend_categories,
      accounts,
      isLoading,
      error: error as Error | null,
    };
  }, [
    costCentersQuery.data,
    costCentersQuery.isLoading,
    costCentersQuery.error,
    spendCategoriesQuery.data,
    spendCategoriesQuery.isLoading,
    spendCategoriesQuery.error,
    accountsQuery.data,
    accountsQuery.isLoading,
    accountsQuery.error,
  ]);
}
