// frontend/src/hooks/usePendingFilters.ts
import { useState, useEffect, useCallback } from 'react';
import type { TransactionFilters } from '../types/filters';

export function usePendingFilters(appliedFilters: TransactionFilters) {
  const [pendingFilters, setPendingFilters] = useState<TransactionFilters>(appliedFilters);

  // Sync with applied filters when they change externally
  useEffect(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  const updateFilter = useCallback((field: keyof TransactionFilters, value: string | string[]) => {
    setPendingFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const reset = useCallback(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  const hasUnsavedChanges = JSON.stringify(appliedFilters) !== JSON.stringify(pendingFilters);

  return {
    pendingFilters,
    updateFilter,
    reset,
    hasUnsavedChanges,
  };
}
