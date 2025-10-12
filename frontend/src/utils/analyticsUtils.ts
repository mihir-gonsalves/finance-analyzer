// frontend/src/utils/analyticsUtils.ts
import type { Transaction, Category } from '../hooks/useTransactions';

const EXCLUDED_CATEGORY_KEYWORDS = ['payment', 'credit', 'income', 'savings'];

export function isValidExpenseCategory(category: Category): boolean {
  const name = category.name.toLowerCase();
  return !EXCLUDED_CATEGORY_KEYWORDS.some(keyword => name.includes(keyword));
}

export function filterValidExpenseCategories(categories: Category[]): Category[] {
  return categories.filter(isValidExpenseCategory);
}

export function calculateCategorySpending(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce((acc, transaction) => {
    // Only count expenses
    if (transaction.amount >= 0) return acc;

    const amount = Math.abs(transaction.amount);

    // Uncategorized transactions
    if (transaction.categories.length === 0) {
      acc["Uncategorized"] = (acc["Uncategorized"] || 0) + amount;
      return acc;
    }

    // Filter valid categories
    const validCategories = filterValidExpenseCategories(transaction.categories);

    if (validCategories.length > 0) {
      validCategories.forEach(category => {
        acc[category.name] = (acc[category.name] || 0) + amount;
      });
    }

    return acc;
  }, {} as Record<string, number>);
}

export function calculateTotalSpent(transactions: Transaction[]): number {
  return transactions
    .filter(t => {
      if (t.amount >= 0) return false;
      if (t.categories.length === 0) return true;
      return t.categories.some(isValidExpenseCategory);
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}