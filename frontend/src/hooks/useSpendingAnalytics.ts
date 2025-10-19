// frontend/src/hooks/useSpendingAnalytics.ts
import { useMemo } from 'react';
import { calculateCategorySpending, calculateTotalSpent, calculateTotalIncome, filterValidExpenseCategories, filterIncome } from '../utils/analyticsUtils';
import type { Transaction } from '../hooks/useTransactions';


export interface CategoryData {
  name: string;
  value: number;
}


export interface SpendingAnalytics {
  categorySpending: Record<string, number>;
  chartData: CategoryData[];
  totalSpent: number;
  totalIncome: number;
  netBalance: number;
  stats: {
    transactionCount: number;
    categoryCount: number;
    expenseCount: number;
    avgPerExpense: number;
    paycheckCount: number;
    avgPerPaycheck: number;
  };
}


export function useSpendingAnalytics(transactions: Transaction[]): SpendingAnalytics {
  return useMemo(() => {
    const categorySpending = calculateCategorySpending(transactions);
    const totalSpent = calculateTotalSpent(transactions);
    const totalIncome = calculateTotalIncome(transactions);

    const chartData: CategoryData[] = Object.entries(categorySpending)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const expenseCount = transactions.filter(transaction => {
      if (transaction.amount >= 0) return false;
      if (transaction.categories.length === 0) return true;
      return transaction.categories.some(cat =>
        filterValidExpenseCategories([cat]).length > 0
      );
    }).length;

    const paycheckCount = transactions.filter(transaction => {
      if (transaction.amount <= 0) return false;
      if (transaction.categories.length === 0) return true;
      return transaction.categories.some(cat =>
        filterIncome([cat]).length > 0
      );
    }).length;

    return {
      categorySpending,
      chartData,
      totalSpent,
      totalIncome,
      netBalance: totalIncome - totalSpent,
      stats: {
        transactionCount: transactions.length,
        categoryCount: Object.keys(categorySpending).length,
        expenseCount,
        avgPerExpense: expenseCount > 0 ? totalSpent / expenseCount : 0,
        paycheckCount,
        avgPerPaycheck: paycheckCount > 0 ? totalIncome / paycheckCount : 0,
      }
    };
  }, [transactions]);
}
