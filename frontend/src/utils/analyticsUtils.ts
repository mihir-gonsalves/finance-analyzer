// frontend/src/utils/analyticsUtils.ts
import type { Transaction, Category } from '../hooks/useTransactions';


// Keywords that indicate non-expense categories (e.g., transfers, income)
const EXCLUDED_CATEGORY_KEYWORDS = ['payment', 'credit', 'income', 'savings'];

const INCOME = ['income'];

/*
 * Determines if a category should be considered a valid expense category.
 */
export function isValidExpenseCategory(category: Category): boolean {
  const name = category.name.toLowerCase();
  return !EXCLUDED_CATEGORY_KEYWORDS.some(keyword => name.includes(keyword));
}


/*
 * Filters out non-expense categories from a list.
 */
export function filterValidExpenseCategories(categories: Category[]): Category[] {
  return categories.filter(isValidExpenseCategory);
}


/*
 * Filters income categories from a list.
 */
export function incomeCategories(category: Category): boolean {
  const name = category.name.toLowerCase();
  return INCOME.some(keyword => name.includes(keyword));
}


/*
 * Filters out non-expense categories from a list.
 */
export function filterIncome(categories: Category[]): Category[] {
  return categories.filter(incomeCategories);
}


/*
 * Calculates total spending per category from a list of transactions.
 */
export function calculateCategorySpending(transactions: Transaction[]): Record<string, number> {
  const categoryTotals: Record<string, number> = {};

  for (const transaction of transactions) {
    if (transaction.amount >= 0) continue; // Only expenses

    const amount = Math.abs(transaction.amount);

    const validCategories = filterValidExpenseCategories(transaction.categories);

    if (validCategories.length > 0) {
      for (const category of validCategories) {
        categoryTotals[category.name] = (categoryTotals[category.name] || 0) + amount;
      }
    } else {
      categoryTotals["Uncategorized"] = (categoryTotals["Uncategorized"] || 0) + amount;
    }
  }

  return categoryTotals;
}


/*
 * Calculates the total amount spent from valid expense transactions.
 */
export function calculateTotalSpent(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    if (t.amount >= 0) return sum;

    const hasValidCategory = t.categories.some(isValidExpenseCategory);
    const isUncategorized = t.categories.length === 0;

    if (hasValidCategory || isUncategorized) {
      return sum + Math.abs(t.amount);
    }

    return sum;
  }, 0);
}


/*
 * Calculates the total amount of income from transactions.
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.amount > 0 ? sum + t.amount : sum;
  }, 0);
}


/*
 * Formats a number into USD currency string.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}
