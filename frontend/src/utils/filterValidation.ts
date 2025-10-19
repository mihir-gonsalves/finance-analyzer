// frontend/src/utils/filterValidation.ts
import type { TransactionFilters } from '../types/filters';


export interface ValidationError {
  field: keyof TransactionFilters;
  message: string;
}


export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}


/**
 * Validate transaction filters before applying them
 */
export function validateFilters(filters: TransactionFilters): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate date range
  if (filters.dateFrom && filters.dateTo) {
    const fromDate = new Date(filters.dateFrom);
    const toDate = new Date(filters.dateTo);

    if (fromDate > toDate) {
      errors.push({
        field: 'dateTo',
        message: 'End date must be after or equal to start date'
      });
    }
  }

  // Validate amount range
  if (filters.minAmount && filters.maxAmount) {
    const min = parseFloat(filters.minAmount);
    const max = parseFloat(filters.maxAmount);

    if (isNaN(min)) {
      errors.push({
        field: 'minAmount',
        message: 'Minimum amount must be a valid number'
      });
    }

    if (isNaN(max)) {
      errors.push({
        field: 'maxAmount',
        message: 'Maximum amount must be a valid number'
      });
    }

    if (!isNaN(min) && !isNaN(max) && min > max) {
      errors.push({
        field: 'maxAmount',
        message: 'Maximum amount must be greater than or equal to minimum amount'
      });
    }
  }

  // Validate individual amount fields
  if (filters.minAmount && isNaN(parseFloat(filters.minAmount))) {
    errors.push({
      field: 'minAmount',
      message: 'Minimum amount must be a valid number'
    });
  }

  if (filters.maxAmount && isNaN(parseFloat(filters.maxAmount))) {
    errors.push({
      field: 'maxAmount',
      message: 'Maximum amount must be a valid number'
    });
  }

  // Validate negative amounts
  if (filters.minAmount && parseFloat(filters.minAmount) < 0) {
    errors.push({
      field: 'minAmount',
      message: 'Amount cannot be negative'
    });
  }

  if (filters.maxAmount && parseFloat(filters.maxAmount) < 0) {
    errors.push({
      field: 'maxAmount',
      message: 'Amount cannot be negative'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}


/**
 * Get user-friendly error message from validation result
 */
export function getValidationErrorMessage(result: ValidationResult): string {
  if (result.isValid) return '';
  return result.errors.map(e => e.message).join('. ');
}


/**
 * Sanitize filter values (trim strings, ensure arrays are valid)
 */
export function sanitizeFilters(filters: TransactionFilters): TransactionFilters {
  return {
    dateFrom: filters.dateFrom.trim(),
    dateTo: filters.dateTo.trim(),
    categories: filters.categories.filter(c => c.trim() !== ''),
    accounts: filters.accounts.filter(a => a.trim() !== ''),
    minAmount: filters.minAmount.trim(),
    maxAmount: filters.maxAmount.trim(),
    searchTerm: filters.searchTerm.trim(),
  };
}
