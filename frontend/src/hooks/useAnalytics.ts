// frontend/src/hooks/useAnalytics.ts - fetches analytics from backend API (totals, trends, time-series, top spending)
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import type { TransactionFilters } from "../types/filters";
import { buildFilterParams } from "../utils/filterUtils";


// ---------------------
// TYPE DEFINITIONS
// ---------------------


export interface TotalsResponse {
  group_by: 'cost_center' | 'spend_category' | 'account';
  totals: Record<string, number>;
  grand_total: number;
  count: number;
  filters_applied: {
    cost_center_ids: number[] | null;
    spend_category_ids: number[] | null;
    accounts: string[] | null;
    date_range: { start: string | null; end: string | null } | null;
    amount_range: { min: number | null; max: number | null } | null;
    search: string | null;
  };
}


export interface ComprehensiveTotalsResponse {
  by_cost_center: Record<string, number>;
  by_spend_category: Record<string, number>;
  by_account: Record<string, number>;
  totals: {
    cost_center_total: number;
    spend_category_total: number;
    account_total: number;
  };
  filters_applied: TotalsResponse['filters_applied'];
}


export interface TopSpendingResponse {
  by: 'spend_category' | 'cost_center';
  limit: number;
  top_items: Array<{ name: string; total: number }>;
  count: number;
  date_range: { start: string | null; end: string | null } | null;
}


export interface AccountSummaryResponse {
  accounts: Array<{
    name: string;
    total: number;
    count: number;
  }>;
  total_accounts: number;
  grand_total: number;
  total_transactions: number;
  date_range: { start: string | null; end: string | null } | null;
}


export interface MonthlyTotalsResponse {
  breakdown_by: 'spend_category' | 'cost_center';
  cost_center_id: number | null;
  monthly_totals: Record<string, Record<string, number>>;
  month_count: number;
  year: number | null;
  date_range: { start: string | null; end: string | null } | null;
}


export interface WeeklyTotalsResponse {
  breakdown_by: 'spend_category' | 'cost_center';
  cost_center_id: number | null;
  weekly_totals: Record<string, Record<string, number>>;
  week_count: number;
  date_range: { start: string | null; end: string | null } | null;
}


export interface TrendsResponse {
  group_by: 'week' | 'month';
  dimension: 'cost_center' | 'spend_category' | 'total';
  time_periods: string[];
  trends: Record<string, Record<string, number>>;
  series: Array<{ name: string; data: number[] }>;
  filters_applied: TotalsResponse['filters_applied'];
}


// ---------------------
// CORE ANALYTICS HOOKS
// ---------------------


/*
 * Fetch totals grouped by dimension (cost_center, spend_category, or account)
 * Supports full filtering capabilities
 */
export function useTotals(groupBy: 'cost_center' | 'spend_category' | 'account', filters?: TransactionFilters) {
  return useQuery<TotalsResponse>({
    queryKey: ["analytics", "totals", groupBy, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ group_by: groupBy });

      if (filters) {
        const filterParams = buildFilterParams(filters);
        filterParams.forEach((value, key) => params.append(key, value));
      }

      const res = await client.get(`/analytics/totals?${params.toString()}`);
      return res.data;
    },
    staleTime: 30000, // 30 seconds
  });
}


/*
 * Fetch comprehensive totals (all three dimensions at once)
 * Useful for dashboard views
 */
export function useComprehensiveTotals(filters?: TransactionFilters) {
  return useQuery<ComprehensiveTotalsResponse>({
    queryKey: ["analytics", "totals", "comprehensive", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters) {
        const filterParams = buildFilterParams(filters);
        filterParams.forEach((value, key) => params.append(key, value));
      }

      const res = await client.get(`/analytics/totals/comprehensive?${params.toString()}`);
      return res.data;
    },
    staleTime: 30000,
  });
}


/*
 * Fetch top spending categories or cost centers
 */
export function useTopSpending(by: 'spend_category' | 'cost_center', limit: number = 10, dateRange?: { start?: string; end?: string }) {
  return useQuery<TopSpendingResponse>({
    queryKey: ["analytics", "top", by, limit, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({ by, limit: limit.toString() });

      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const res = await client.get(`/analytics/top?${params.toString()}`);
      return res.data;
    },
    staleTime: 60000, // 1 minute
  });
}


/*
 * Fetch account summary with totals and counts
 */
export function useAccountSummary(dateRange?: { start?: string; end?: string }) {
  return useQuery<AccountSummaryResponse>({
    queryKey: ["analytics", "accounts", "summary", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const res = await client.get(`/analytics/accounts/summary?${params.toString()}`);
      return res.data;
    },
    staleTime: 60000,
  });
}


// ---------------------
// TIME-BASED ANALYTICS
// ---------------------


/*
 * Fetch monthly spending breakdown
 */
export function useMonthlyBreakdown(costCenterId?: number, options?: { year?: number; start?: string; end?: string }) {
  return useQuery<MonthlyTotalsResponse>({
    queryKey: ["analytics", "monthly", costCenterId, options],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (costCenterId) params.append('cost_center_id', costCenterId.toString());
      if (options?.year) params.append('year', options.year.toString());
      if (options?.start) params.append('start', options.start);
      if (options?.end) params.append('end', options.end);

      const res = await client.get(`/analytics/time/monthly?${params.toString()}`);
      return res.data;
    },
    staleTime: 60000,
  });
}


/*
 * Fetch weekly spending breakdown
 */
export function useWeeklyBreakdown(costCenterId?: number, dateRange?: { start?: string; end?: string }) {
  return useQuery<WeeklyTotalsResponse>({
    queryKey: ["analytics", "weekly", costCenterId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (costCenterId) params.append('cost_center_id', costCenterId.toString());
      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const res = await client.get(`/analytics/time/weekly?${params.toString()}`);
      return res.data;
    },
    staleTime: 60000,
  });
}


/*
 * Fetch spending trends for visualization
 */
export function useTrends(groupBy: 'week' | 'month', dimension: 'cost_center' | 'spend_category' | 'total', filters?: TransactionFilters) {
  return useQuery<TrendsResponse>({
    queryKey: ["analytics", "trends", groupBy, dimension, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        group_by: groupBy,
        dimension: dimension,
      });

      if (filters) {
        const filterParams = buildFilterParams(filters);
        filterParams.forEach((value, key) => params.append(key, value));
      }

      const res = await client.get(`/analytics/trends/trends?${params.toString()}`);
      return res.data;
    },
    staleTime: 60000,
  });
}


// ---------------------
// SPECIFIC ANALYTICS
// ---------------------


/*
 * Fetch total for a specific cost center
 */
export function useCostCenterTotal(costCenterId: number, dateRange?: { start?: string; end?: string }) {
  return useQuery<{ cost_center_id: number; total: number; date_range: any }>({
    queryKey: ["analytics", "cost_center", costCenterId, "total", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const res = await client.get(`/analytics/totals/cost_center/${costCenterId}?${params.toString()}`);
      return res.data;
    },
    staleTime: 60000,
  });
}


/*
 * Fetch total for a specific spend category
 */
export function useSpendCategoryTotal(spendCategoryId: number, dateRange?: { start?: string; end?: string }) {
  return useQuery<{ spend_category_id: number; total: number; date_range: any }>({
    queryKey: ["analytics", "spend_category", spendCategoryId, "total", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const res = await client.get(`/analytics/totals/spend_category/${spendCategoryId}?${params.toString()}`);
      return res.data;
    },
    staleTime: 60000,
  });
}


/*
 * Search-based analytics
 */
export function useSearchAnalytics(searchTerm: string, dateRange?: { start?: string; end?: string }) {
  return useQuery<{ search: string; total: number; date_range: any }>({
    queryKey: ["analytics", "search", searchTerm, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({ search: searchTerm });

      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const res = await client.get(`/analytics/search?${params.toString()}`);
      return res.data;
    },
    staleTime: 30000,
    enabled: searchTerm.length > 0, // Only fetch if there's a search term
  });
}
