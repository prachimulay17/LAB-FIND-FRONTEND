/**
 * /auth/callback
 *
 * Supabase email links (confirmation, password-reset, magic-link) all redirect
 * here. The Supabase JS client automatically exchanges the fragment tokens in
 * the URL for a session. We just need to detect which flow it was and route the
 * user to the right place.
 *
 * Password-reset flows land here with event=PASSWORD_RECOVERY — redirect to
 * /reset-password so the user can choose a new password.
 * All other flows (email confirmation, magic-link) redirect to /dashboard.
 */

import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { FlaskConical } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Signing you in… — LabFind" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // onAuthStateChange fires once the SDK has parsed the URL hash and
    // exchanged tokens. We listen for one event then clean up.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        void navigate({ to: "/reset-password" });
      } else if (event === "SIGNED_IN") {
        void navigate({ to: "/dashboard" });
      }
      subscription.unsubscribe();
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <FlaskConical className="size-5 animate-pulse text-primary" strokeWidth={1.75} />
        <span className="text-[14px]">Signing you in…</span>
      </div>
    </div>
  );
}
