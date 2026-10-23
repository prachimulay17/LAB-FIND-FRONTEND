/**
 * useAuth — subscribes to Supabase auth state changes and exposes a stable
 * { user, session, profile, loading } object to the rest of the app.
 *
 * Call this hook anywhere inside the QueryClientProvider tree (i.e. inside
 * RootComponent in __root.tsx). The hook is stable — it does not re-render
 * consumers unless user/session identity actually changes.
 */

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getProfile, type Profile } from "@/lib/api/auth";
import type { Session, User } from "@/lib/supabase.types";

export const AUTH_SESSION_KEY = ["auth", "session"] as const;
export const AUTH_PROFILE_KEY = (id: string) => ["auth", "profile", id] as const;

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** True only on the very first load before Supabase has responded. */
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const queryClient = useQueryClient();

  // Track raw session from Supabase listener
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    // getSession() resolves from local storage — fast, no network round-trip.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        // Invalidate profile cache on any auth event so it re-fetches.
        if (newSession?.user) {
          void queryClient.invalidateQueries({
            queryKey: AUTH_PROFILE_KEY(newSession.user.id),
          });
        } else {
          // Signed out — clear all auth queries.
          void queryClient.removeQueries({ queryKey: ["auth"] });
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Fetch profile only when we have a confirmed user id.
  const userId = session?.user?.id;
  const { data: profile = null } = useQuery({
    queryKey: userId ? AUTH_PROFILE_KEY(userId) : ["auth", "profile", "none"],
    queryFn: () => (userId ? getProfile(userId) : Promise.resolve(null)),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  const loading = session === undefined;

  return {
    session: session ?? null,
    user: session?.user ?? null,
    profile,
    loading,
    isAuthenticated: Boolean(session?.user),
  };
}
