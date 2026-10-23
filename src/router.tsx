import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { Session } from "@/lib/supabase.types";

export interface RouterContext {
  queryClient: QueryClient;
  session: Session | null;
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    // session starts null; the root component updates it via onAuthStateChange.
    context: { queryClient, session: null } satisfies RouterContext,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
