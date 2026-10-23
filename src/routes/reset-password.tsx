import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — LabFind" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
