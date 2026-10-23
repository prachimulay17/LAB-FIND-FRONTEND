/**
 * useLabs — fetches all labs with their test pricing from Supabase.
 * Used by the results/search page for scoring.
 *
 * staleTime: 5 min — lab data doesn't change between page navigations.
 * gcTime (formerly cacheTime): 10 min.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchLabs } from "@/lib/api/labs";
import { LABS } from "@/data/labs";

export const LABS_QUERY_KEY = ["labs"] as const;

export function useLabs() {
  return useQuery({
    queryKey: LABS_QUERY_KEY,
    queryFn: fetchLabs,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Keep the static mock array as placeholder data while the first fetch is
    // in flight so the page renders immediately without a loading state gap.
    placeholderData: LABS,
  });
}
