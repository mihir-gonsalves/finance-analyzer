// frontend/src/hooks/usePendingFilters.ts
import { useState, useEffect, useCallback } from 'react';
import type { TransactionFilters } from '../types/filters';
import { areFiltersEqual } from '../utils/filterUtils';


export function usePendingFilters(appliedFilters: TransactionFilters) {
  const [pendingFilters, setPendingFilters] = useState<TransactionFilters>(appliedFilters);

  // Sync with applied filters when they change externally
  useEffect(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  const updateFilter = useCallback((
    field: keyof TransactionFilters,
    value: string | string[]
  ) => {
    setPendingFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  // Batch update multiple filters at once
  const updateFilters = useCallback((updates: Partial<TransactionFilters>) => {
    setPendingFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  // Use proper deep equality check
  const hasUnsavedChanges = !areFiltersEqual(appliedFilters, pendingFilters);

  return {
    pendingFilters,
    updateFilter,
    updateFilters,
    reset,
    hasUnsavedChanges,
  };
}
