/**
 * useLabById — fetches a single lab with all its relations from Supabase.
 * Used by the lab detail page.
 *
 * Returns null (not throws) when the lab does not exist so the page can
 * call notFound() rather than rendering an error boundary.
 *
 * staleTime: 5 min.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchLabById } from "@/lib/api/labs";

export const LAB_BY_ID_QUERY_KEY = (id: string) => ["labs", id] as const;

export function useLabById(id: string) {
  return useQuery({
    queryKey: LAB_BY_ID_QUERY_KEY(id),
    queryFn: () => fetchLabById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Don't retry on not-found — PGRST116 returns null, not an error.
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("PGRST116")) return false;
      return failureCount < 2;
    },
  });
}
