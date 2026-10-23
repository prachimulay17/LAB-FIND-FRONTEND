import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getSession } from "@/lib/api/auth";

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Create account — LabFind" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return <SignUpForm />;
}
