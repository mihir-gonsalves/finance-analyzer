// frontend/src/utils/dateUtils.ts - date parsing, formatting, and manipulation utilities
export function parseDateString(dateStr: string): Date {
  /*
   * Parses a date string in YYYY-MM-DD format into a Date object without timezone conversion.
   * Falls back to using the native Date parser if parsing fails.
   */
  if (!dateStr) return new Date();

  const [yearStr, monthStr, dayStr] = dateStr.split('T')[0].split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed in JS Date
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    // Fallback to native parser (may include timezone conversion)
    return new Date(dateStr);
  }

  return new Date(year, month, day); // No timezone offset applied
}


export function formatDateString(
  /*
   * Formats a date string into a human-readable string using Intl.DateTimeFormat.
   * Returns the original string if formatting fails.
   */
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return "";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  try {
    const date = parseDateString(dateStr);
    if (isNaN(date.getTime())) throw new Error("Invalid Date");
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  } catch {
    return dateStr;
  }
}


export function getTodayDateString(): string {
  /*
   * Returns today's date in YYYY-MM-DD format.
   */
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
