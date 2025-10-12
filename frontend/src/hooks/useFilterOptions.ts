// frontend/src/hooks/useFilterOptions.ts
import { useMemo } from 'react';
import type { Transaction } from './useTransactions';

export interface FilterOptions {
  categories: string[];
  accounts: string[];
}

export function useFilterOptions(transactions: Transaction[]): FilterOptions {
  return useMemo(() => {
    // Extract all category names
    const allCategoryNames = transactions.flatMap(t =>
      t.categories ? t.categories.map(cat => cat.name) : []
    );
    const uniqueCategories = Array.from(new Set(allCategoryNames)).sort();

    // Extract all account names
    const uniqueAccounts = Array.from(
      new Set(transactions.map(t => t.account).filter(Boolean))
    ).sort();

    return {
      categories: uniqueCategories,
      accounts: uniqueAccounts,
    };
  }, [transactions]);
}
