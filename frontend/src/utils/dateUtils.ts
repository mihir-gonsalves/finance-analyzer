// frontend/src/utils/dateUtils.ts
// Utility functions for consistent date handling
// Prevents timezone offset issues when working with date-only strings
/*
 * Parse a date string (YYYY-MM-DD) into a Date object without timezone conversion
 */
export function parseDateString(dateStr: string): Date {
  if (!dateStr) return new Date();

  try {
    const dateParts = dateStr.split('T')[0].split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);
    return new Date(year, month, day);
  } catch {
    return new Date(dateStr);
  }
}

/**
 * Format a date string consistently without timezone issues
 */
export function formatDateString(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return "";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  try {
    const date = parseDateString(dateStr);
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  } catch {
    return dateStr;
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}