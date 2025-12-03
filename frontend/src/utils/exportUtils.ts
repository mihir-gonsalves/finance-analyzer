// frontend/src/utils/exportUtils.ts
import type { Transaction } from '../hooks/useTransactions';

// ========================
// CONSTANTS
// ========================

const CSV_CONFIG = {
  HEADERS: ['Date', 'Description', 'Amount', 'Account', 'Cost Center', 'Spend Categories'],
  MIME_TYPE: 'text/csv;charset=utf-8;',
  FILENAME_PREFIX: 'transactions',
  UNCATEGORIZED: 'Uncategorized',
} as const;

// ========================
// UTILITY FUNCTIONS
// ========================

/**
 * Escape quotes in CSV values
 */
function escapeCSVValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Format transaction row for CSV
 */
function formatTransactionRow(txn: Transaction): string[] {
  const costCenter = txn.cost_center?.name || CSV_CONFIG.UNCATEGORIZED;
  const spendCategories = txn.spend_categories && txn.spend_categories.length > 0
    ? txn.spend_categories.map(cat => cat.name).join(', ')
    : CSV_CONFIG.UNCATEGORIZED;

  return [
    txn.date,
    escapeCSVValue(txn.description),
    txn.amount.toString(),
    escapeCSVValue(txn.account),
    escapeCSVValue(costCenter),
    escapeCSVValue(spendCategories),
  ];
}

/**
 * Generate CSV filename with timestamp
 */
function generateFilename(): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${CSV_CONFIG.FILENAME_PREFIX}_${timestamp}.csv`;
}

/**
 * Create and trigger download of CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: CSV_CONFIG.MIME_TYPE });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ========================
// MAIN EXPORT FUNCTION
// ========================

/**
 * Export transactions to CSV file
 * Downloads a CSV file containing all transaction data
 */
export function exportTransactionsToCSV(transactions: Transaction[]): void {
  if (transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  // Convert transactions to CSV rows
  const rows = transactions.map(formatTransactionRow);

  // Combine headers and rows
  const csvContent = [
    CSV_CONFIG.HEADERS.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Generate filename and trigger download
  const filename = generateFilename();
  downloadCSV(csvContent, filename);
}
