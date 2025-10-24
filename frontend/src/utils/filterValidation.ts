// frontend/src/utils/filterValidation.ts - validates filter inputs (date ranges, amount ranges) before applying
import type { TransactionFilters } from '../types/filters';


export interface ValidationError {
  field: keyof TransactionFilters;
  message: string;
}


export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}


/*
 * Validate transaction filters before applying them
 */
export function validateFilters(filters: TransactionFilters): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate date range
  if (filters.dateFrom && filters.dateTo) {
    const fromDate = new Date(filters.dateFrom);
    const toDate = new Date(filters.dateTo);

    // Check for invalid dates
    if (isNaN(fromDate.getTime())) {
      errors.push({
        field: 'dateFrom',
        message: 'Start date is invalid'
      });
    }

    if (isNaN(toDate.getTime())) {
      errors.push({
        field: 'dateTo',
        message: 'End date is invalid'
      });
    }

    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      if (fromDate > toDate) {
        errors.push({
          field: 'dateTo',
          message: 'End date must be after or equal to start date'
        });
      }

      // Warn about future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (fromDate > today) {
        errors.push({
          field: 'dateFrom',
          message: 'Start date cannot be in the future'
        });
      }

      if (toDate > today) {
        errors.push({
          field: 'dateTo',
          message: 'End date cannot be in the future'
        });
      }
    }
  } else {
    // Check individual dates if only one is provided
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      if (isNaN(fromDate.getTime())) {
        errors.push({
          field: 'dateFrom',
          message: 'Start date is invalid'
        });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (fromDate > today) {
          errors.push({
            field: 'dateFrom',
            message: 'Start date cannot be in the future'
          });
        }
      }
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      if (isNaN(toDate.getTime())) {
        errors.push({
          field: 'dateTo',
          message: 'End date is invalid'
        });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (toDate > today) {
          errors.push({
            field: 'dateTo',
            message: 'End date cannot be in the future'
          });
        }
      }
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

  return {
    isValid: errors.length === 0,
    errors
  };
}


/*
 * Get user-friendly error message from validation result
 */
export function getValidationErrorMessage(result: ValidationResult): string {
  if (result.isValid) return '';
  return result.errors.map(e => e.message).join('. ');
}


/*
 * Sanitize filter values (trim strings, ensure arrays are valid)
 */
export function sanitizeFilters(filters: TransactionFilters): TransactionFilters {
  return {
    dateFrom: filters.dateFrom.trim(),
    dateTo: filters.dateTo.trim(),
    spend_category_ids: filters.spend_category_ids.filter(id => !isNaN(id)),
    cost_center_ids: filters.cost_center_ids.filter(id => !isNaN(id)),
    accounts: filters.accounts.filter(a => a.trim() !== ''),
    minAmount: filters.minAmount.trim(),
    maxAmount: filters.maxAmount.trim(),
    searchTerm: filters.searchTerm.trim(),
  };
}
