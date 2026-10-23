/**
 * useTests — fetches the canonical test catalog from Supabase.
 *
 * staleTime: 30 min — the test catalog changes rarely.
 * placeholderData: static mock so TestSelector renders immediately.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchTests } from "@/lib/api/tests";
import { TEST_CATALOG } from "@/data/tests";

export const TESTS_QUERY_KEY = ["tests"] as const;

export function useTests() {
  return useQuery({
    queryKey: TESTS_QUERY_KEY,
    queryFn: fetchTests,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    placeholderData: TEST_CATALOG,
  });
}
