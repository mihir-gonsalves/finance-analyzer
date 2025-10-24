// frontend/src/utils/exportUtils.ts - CSV export functionality
import type { Transaction } from '../hooks/useTransactions';


/*
 * Export transactions to CSV file
 * Downloads a CSV file containing all transaction data
 */
export function exportTransactionsToCSV(transactions: Transaction[]) {
  if (transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  // CSV headers
  const headers = ['Date', 'Description', 'Amount', 'Account', 'Cost Center', 'Spend Categories'];

  // Convert transactions to CSV rows
  const rows = transactions.map(txn => {
    const costCenter = txn.cost_center?.name || 'Uncategorized';
    const spendCategories = txn.spend_categories && txn.spend_categories.length > 0
      ? txn.spend_categories.map(cat => cat.name).join(', ')
      : 'Uncategorized';

    return [
      txn.date,
      `"${txn.description.replace(/"/g, '""')}"`, // Escape quotes in description
      txn.amount,
      `"${txn.account.replace(/"/g, '""')}"`,
      `"${costCenter.replace(/"/g, '""')}"`,
      `"${spendCategories.replace(/"/g, '""')}"`
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `transactions_${timestamp}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


/*
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
