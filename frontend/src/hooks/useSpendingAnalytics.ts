// frontend/src/hooks/useSpendingAnalytics.ts - quick client-side analytics calculations on already-fetched transactions
import { useMemo } from 'react';
import {
  calculateTotalExpenses,
  calculateTotalIncome,
  calculateNetBalance,
  getExpenseCount,
  getIncomeCount,
  calculateAverageExpense,
  groupExpensesByCostCenter,
  groupExpensesBySpendCategory,
  toChartData
} from '../utils/analyticsUtils';
import type { Transaction } from './useTransactions';

// ========================
// TYPE DEFINITIONS
// ========================

export interface SpendCategoryData {
  name: string;
  value: number;
}

export interface SpendingAnalytics {
  costCenterSpending: Record<string, number>;
  spendCategorySpending: Record<string, number>;
  costCenterChartData: SpendCategoryData[];
  spendCategoryChartData: SpendCategoryData[];
  totalExpenses: number;
  totalIncome: number;
  totalSpent: number;
  netBalance: number;
  stats: {
    transactionCount: number;
    expenseCount: number;
    incomeCount: number;
    paycheckCount: number;
    avgExpense: number;
    avgPerExpense: number;
    avgIncome: number;
    avgPerPaycheck: number;
    costCenterCount: number;
    spendCategoryCount: number;
  };
}

// ========================
// CONSTANTS
// ========================

const PAYCHECK_CATEGORY = 'paycheck';

// ========================
// UTILITY FUNCTIONS
// ========================

/**
 * Check if transaction has "paycheck" spend category
 */
function isPaycheck(transaction: Transaction): boolean {
  if (!transaction.spend_categories || transaction.spend_categories.length === 0) {
    return false;
  }
  return transaction.spend_categories.some(
    cat => cat.name.toLowerCase() === PAYCHECK_CATEGORY
  );
}

/**
 * Calculate paycheck statistics
 */
function calculatePaycheckStats(transactions: Transaction[]): {
  count: number;
  total: number;
  average: number;
} {
  const paychecks = transactions.filter(t => t.amount > 0 && isPaycheck(t));
  const count = paychecks.length;
  const total = paychecks.reduce((sum, t) => sum + t.amount, 0);
  const average = count > 0 ? total / count : 0;

  return { count, total, average };
}

// ========================
// HOOK
// ========================

/**
 * Calculate spending analytics from transactions
 * 
 * NOTE: For production dashboards with filters, prefer using the backend
 * analytics API. This is for quick client-side calculations.
 */
export function useSpendingAnalytics(transactions: Transaction[]): SpendingAnalytics {
  return useMemo(() => {
    // Calculate spending by dimensions
    const costCenterSpending = groupExpensesByCostCenter(transactions);
    const spendCategorySpending = groupExpensesBySpendCategory(transactions);

    // Calculate financial totals
    const totalExpenses = calculateTotalExpenses(transactions);
    const totalIncome = calculateTotalIncome(transactions);
    const netBalance = calculateNetBalance(transactions);

    // Calculate statistics
    const expenseCount = getExpenseCount(transactions);
    const incomeCount = getIncomeCount(transactions);
    const avgExpense = calculateAverageExpense(transactions);
    const avgIncome = totalIncome / (incomeCount > 0 ? incomeCount : 1);
    const paycheckStats = calculatePaycheckStats(transactions);

    // Prepare chart data (sorted by value descending)
    const costCenterChartData = toChartData(costCenterSpending, true);
    const spendCategoryChartData = toChartData(spendCategorySpending, true);

    return {
      costCenterSpending,
      spendCategorySpending,
      costCenterChartData,
      spendCategoryChartData,
      totalExpenses,
      totalIncome,
      totalSpent: totalExpenses,
      netBalance,
      stats: {
        transactionCount: transactions.length,
        expenseCount,
        incomeCount,
        paycheckCount: paycheckStats.count,
        avgExpense,
        avgPerExpense: avgExpense,
        avgIncome,
        avgPerPaycheck: paycheckStats.average,
        costCenterCount: Object.keys(costCenterSpending).length,
        spendCategoryCount: Object.keys(spendCategorySpending).length,
      }
    };
  }, [transactions]);
}
