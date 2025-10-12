// frontend/src/hooks/usePendingFilters.ts
import { useState, useEffect, useCallback } from 'react';
import type { FilterState } from '../types/filters';

export function usePendingFilters(appliedFilters: FilterState) {
  const [pendingFilters, setPendingFilters] = useState<FilterState>(appliedFilters);

  // Sync with applied filters when they change externally
  useEffect(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  const updateFilter = useCallback((field: keyof FilterState, value: string | string[]) => {
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
