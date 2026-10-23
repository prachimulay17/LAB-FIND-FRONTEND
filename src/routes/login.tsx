import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/lib/api/auth";

export const Route = createFileRoute("/login")({
  // Already logged in → skip the login page
  beforeLoad: async () => {
    const session = await getSession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — LabFind" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return <LoginForm />;
}
