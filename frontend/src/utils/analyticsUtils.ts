// frontend/src/utils/analyticsUtils.ts
import type { Transaction } from '../hooks/useTransactions';

// ========================
// TRANSACTION CLASSIFICATION
// ========================

export function isExpense(transaction: Transaction): boolean {
  return transaction.amount < 0;
}

export function isIncome(transaction: Transaction): boolean {
  return transaction.amount > 0;
}

export function hasCostCenter(transaction: Transaction): boolean {
  return transaction.cost_center !== null && transaction.cost_center !== undefined;
}

export function hasSpendCategories(transaction: Transaction): boolean {
  return transaction.spend_categories && transaction.spend_categories.length > 0;
}

export function isCategorized(transaction: Transaction): boolean {
  return hasCostCenter(transaction) || hasSpendCategories(transaction);
}

// ========================
// BASIC AGGREGATIONS
// ========================

export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) =>
    t.amount < 0 ? sum + Math.abs(t.amount) : sum, 0
  );
}

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) =>
    t.amount > 0 ? sum + t.amount : sum, 0
  );
}

export function calculateNetBalance(transactions: Transaction[]): number {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
}

export function getTransactionCount(transactions: Transaction[]): number {
  return transactions.length;
}

export function getExpenseCount(transactions: Transaction[]): number {
  return transactions.filter(isExpense).length;
}

export function getIncomeCount(transactions: Transaction[]): number {
  return transactions.filter(isIncome).length;
}

export function calculateAverageExpense(transactions: Transaction[]): number {
  const expenseCount = getExpenseCount(transactions);
  if (expenseCount === 0) return 0;
  return calculateTotalExpenses(transactions) / expenseCount;
}

export function calculateAverageIncome(transactions: Transaction[]): number {
  const incomeCount = getIncomeCount(transactions);
  if (incomeCount === 0) return 0;
  return calculateTotalIncome(transactions) / incomeCount;
}

// ========================
// GROUPING BY DIMENSIONS
// ========================

export function groupExpensesByCostCenter(transactions: Transaction[]): Record<string, number> {
  const totals: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.amount >= 0) return;

    const costCenterName = t.cost_center?.name || "Uncategorized";
    const amount = Math.abs(t.amount);
    totals[costCenterName] = (totals[costCenterName] || 0) + amount;
  });

  return totals;
}

export function groupExpensesBySpendCategory(transactions: Transaction[]): Record<string, number> {
  const totals: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.amount >= 0) return;

    const amount = Math.abs(t.amount);

    if (!t.spend_categories || t.spend_categories.length === 0) {
      totals["Uncategorized"] = (totals["Uncategorized"] || 0) + amount;
      return;
    }

    t.spend_categories.forEach(cat => {
      totals[cat.name] = (totals[cat.name] || 0) + amount;
    });
  });

  return totals;
}

export function groupByAccount(transactions: Transaction[]): Record<string, { count: number; total: number }> {
  const groups: Record<string, { count: number; total: number }> = {};

  transactions.forEach(t => {
    if (!groups[t.account]) {
      groups[t.account] = { count: 0, total: 0 };
    }
    groups[t.account].count++;
    groups[t.account].total += Math.abs(t.amount);
  });

  return groups;
}

// ========================
// TOP N CALCULATIONS
// ========================

export interface RankedItem {
  name: string;
  amount: number;
  percentage?: number;
}

export function getTopN(
  spending: Record<string, number>,
  limit = 5,
  includePercentage = false
): RankedItem[] {
  const total = Object.values(spending).reduce((sum, val) => sum + val, 0);

  return Object.entries(spending)
    .map(([name, amount]) => ({
      name,
      amount,
      ...(includePercentage && total > 0 ? { percentage: (amount / total) * 100 } : {})
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getTopCostCenters(transactions: Transaction[], limit = 5): RankedItem[] {
  const spending = groupExpensesByCostCenter(transactions);
  return getTopN(spending, limit, true);
}

export function getTopSpendCategories(transactions: Transaction[], limit = 5): RankedItem[] {
  const spending = groupExpensesBySpendCategory(transactions);
  return getTopN(spending, limit, true);
}

// ========================
// FORMATTING UTILITIES
// ========================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return formatCurrency(value);
}

// ========================
// CHART DATA HELPERS
// ========================

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export function toChartData(spending: Record<string, number>, sortDescending = true): ChartDataPoint[] {
  const data = Object.entries(spending).map(([name, value]) => ({ name, value }));
  return sortDescending
    ? data.sort((a, b) => b.value - a.value)
    : data.sort((a, b) => a.name.localeCompare(b.name));
}

export function preparePieChartData(spending: Record<string, number>, maxSlices = 8): ChartDataPoint[] {
  const sorted = Object.entries(spending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (sorted.length <= maxSlices) return sorted;

  const topSlices = sorted.slice(0, maxSlices - 1);
  const otherAmount = sorted.slice(maxSlices - 1).reduce((sum, item) => sum + item.value, 0);

  return [...topSlices, { name: 'Other', value: otherAmount }];
}
