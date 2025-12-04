// frontend/src/hooks/usePendingFilters.ts - manages unsaved filter state before applying to avoid unnecessary API calls
import { useState, useEffect, useCallback } from 'react';
import type { TransactionFilters } from '../types/filters';
import { areFiltersEqual } from '../utils/filterUtils';

// ========================
// HOOK
// ========================

/**
 * Manages pending filter state before applying to avoid unnecessary API calls
 * Tracks unsaved changes and provides update/reset functions
 */
export function usePendingFilters(appliedFilters: TransactionFilters) {
  const [pendingFilters, setPendingFilters] = useState<TransactionFilters>(appliedFilters);

  // Sync with applied filters when they change externally
  useEffect(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  const updateFilter = useCallback((
    field: keyof TransactionFilters,
    value: string | string[] | number[]
  ) => {
    setPendingFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateFilters = useCallback((updates: Partial<TransactionFilters>) => {
    setPendingFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  const hasUnsavedChanges = !areFiltersEqual(appliedFilters, pendingFilters);

  return {
    pendingFilters,
    updateFilter,
    updateFilters,
    reset,
    hasUnsavedChanges,
  };
}
