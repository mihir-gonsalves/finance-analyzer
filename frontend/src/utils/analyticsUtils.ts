// frontend/src/utils/analyticsUtils.ts - client-side analytics calculations (totals, grouping, formatting, chart data prep)
import type { Transaction } from '../hooks/useTransactions';


/*
 * NOTE: These utility functions are for quick client-side calculations when needed.
 */


// ---------------------
// TRANSACTION CLASSIFICATION
// ---------------------


/*
 * Determines if a transaction is an expense (negative amount)
 */
export function isExpense(transaction: Transaction): boolean {
  return transaction.amount < 0;
}


/*
 * Determines if a transaction is income (positive amount)
 */
export function isIncome(transaction: Transaction): boolean {
  return transaction.amount > 0;
}


/*
 * Determines if a transaction has a cost center assigned
 */
export function hasCostCenter(transaction: Transaction): boolean {
  return transaction.cost_center !== null && transaction.cost_center !== undefined;
}


/*
 * Determines if a transaction has spend categories assigned
 */
export function hasSpendCategories(transaction: Transaction): boolean {
  return transaction.spend_categories && transaction.spend_categories.length > 0;
}


/*
 * Determines if a transaction is categorized (has either cost center or spend categories)
 */
export function isCategorized(transaction: Transaction): boolean {
  return hasCostCenter(transaction) || hasSpendCategories(transaction);
}


// ---------------------
// BASIC AGGREGATIONS
// ---------------------


/*
 * Calculate total expenses from transactions (sum of negative amounts)
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.amount < 0 ? sum + Math.abs(t.amount) : sum;
  }, 0);
}


/*
 * Calculate total income from transactions (sum of positive amounts)
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.amount > 0 ? sum + t.amount : sum;
  }, 0);
}


/*
 * Calculate net balance (income - expenses)
 */
export function calculateNetBalance(transactions: Transaction[]): number {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
}


/*
 * Calculate total transaction count
 */
export function getTransactionCount(transactions: Transaction[]): number {
  return transactions.length;
}


/*
 * Calculate expense transaction count
 */
export function getExpenseCount(transactions: Transaction[]): number {
  return transactions.filter(isExpense).length;
}


/*
 * Calculate income transaction count
 */
export function getIncomeCount(transactions: Transaction[]): number {
  return transactions.filter(isIncome).length;
}


/*
 * Calculate average expense amount
 */
export function calculateAverageExpense(transactions: Transaction[]): number {
  const expenseCount = getExpenseCount(transactions);
  if (expenseCount === 0) return 0;
  return calculateTotalExpenses(transactions) / expenseCount;
}


/*
 * Calculate average income amount
 */
export function calculateAverageIncome(transactions: Transaction[]): number {
  const incomeCount = getIncomeCount(transactions);
  if (incomeCount === 0) return 0;
  return calculateTotalIncome(transactions) / incomeCount;
}


// ---------------------
// GROUPING BY DIMENSIONS
// ---------------------


/*
 * Group expenses by cost center
 * NOTE: For production use, prefer backend endpoint /analytics/totals?group_by=cost_center
 */
export function groupExpensesByCostCenter(transactions: Transaction[]): Record<string, number> {
  const totals: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.amount >= 0) return; // Only expenses

    const costCenterName = t.cost_center?.name || "Uncategorized";
    const amount = Math.abs(t.amount);
    totals[costCenterName] = (totals[costCenterName] || 0) + amount;
  });

  return totals;
}


/*
 * Group expenses by spend category WITHOUT splitting amounts
 * Each spend category gets the FULL transaction amount
 */
export function groupExpensesBySpendCategory(transactions: Transaction[]): Record<string, number> {
  const totals: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.amount >= 0) return; // Only expenses

    const amount = Math.abs(t.amount);

    if (!t.spend_categories || t.spend_categories.length === 0) {
      totals["Uncategorized"] = (totals["Uncategorized"] || 0) + amount;
      return;
    }

    // Each category gets the FULL amount (not split)
    t.spend_categories.forEach(cat => {
      totals[cat.name] = (totals[cat.name] || 0) + amount;
    });
  });

  return totals;
}


/*
 * Group transactions by account
 */
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


// ---------------------
// TOP N CALCULATIONS
// ---------------------


export interface RankedItem {
  name: string;
  amount: number;
  percentage?: number;
}


/*
 * Get top N items from a spending breakdown
 */
export function getTopN(spending: Record<string, number>, limit: number = 5, includePercentage: boolean = false): RankedItem[] {
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


/*
 * Get top cost centers by spending
 */
export function getTopCostCenters(transactions: Transaction[], limit: number = 5): RankedItem[] {
  const spending = groupExpensesByCostCenter(transactions);
  return getTopN(spending, limit, true);
}


/*
 * Get top spend categories by spending
 */
export function getTopSpendCategories(transactions: Transaction[], limit: number = 5): RankedItem[] {
  const spending = groupExpensesBySpendCategory(transactions);
  return getTopN(spending, limit, true);
}


// ---------------------
// FORMATTING UTILITIES
// ---------------------


/*
 * Format a number as USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}


/*
 * Format a number as a percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}


/*
 * Format a large number with abbreviations (K, M, B)
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}


// ---------------------
// CHART DATA HELPERS
// ---------------------


export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}


/*
 * Convert spending record to chart data format
 */
export function toChartData(spending: Record<string, number>, sortDescending: boolean = true): ChartDataPoint[] {
  const data = Object.entries(spending).map(([name, value]) => ({ name, value }));
  return sortDescending
    ? data.sort((a, b) => b.value - a.value)
    : data.sort((a, b) => a.name.localeCompare(b.name));
}


/*
 * Prepare pie chart data with "Other" category for small slices
 */
export function preparePieChartData(spending: Record<string, number>, maxSlices: number = 8): ChartDataPoint[] {
  const sorted = Object.entries(spending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (sorted.length <= maxSlices) {
    return sorted;
  }

  const topSlices = sorted.slice(0, maxSlices - 1);
  const otherAmount = sorted.slice(maxSlices - 1).reduce((sum, item) => sum + item.value, 0);

  return [...topSlices, { name: 'Other', value: otherAmount }];
}
