import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { resetPassword, updatePassword } from "@/lib/api/auth";
import { AuthCard } from "./AuthCard";
import { FieldError } from "./FieldError";
import { useAuth } from "@/hooks/useAuth";

// The Supabase recovery link lands on /auth/callback which sets the session
// to recovery mode. When we detect an active session here we show the
// update-password form instead of the request form.

export function ResetPasswordForm() {
  const { session } = useAuth();
  // If the URL was a recovery link, Supabase sets event=PASSWORD_RECOVERY
  // and the session type is "recovery" — show update form.
  const isRecovery = session?.user != null;

  return isRecovery ? <UpdatePasswordForm /> : <RequestResetForm />;
}

function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setEmailError("Email is required."); return; }

    setSubmitting(true);
    const origin = window.location.origin;
    const { error } = await resetPassword(email, `${origin}/auth/callback`);
    setSubmitting(false);

    if (error) { setFormError(error.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check your email">
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          If an account exists for <strong>{email}</strong>, we sent a password-reset
          link. It expires in 1 hour.
        </p>
        <Link to="/login" className="mt-4 block text-center text-[13px] font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll send a reset link to your email."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-[13px] text-destructive">
            {formError}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-[13px] font-medium">Email</label>
          <input
            id="email" type="email" autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); setFormError(""); }}
            className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="you@example.com"
          />
          <FieldError message={emailError} />
        </div>
        <button
          type="submit" disabled={submitting}
          className="mt-2 h-11 w-full rounded-md bg-primary text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}

function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    password?: string | undefined;
    confirm?: string | undefined;
    form?: string | undefined;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (confirm !== password) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) { setErrors({ form: error.message }); return; }
    setDone(true);
  }

  if (done) {
    return (
      <AuthCard title="Password updated">
        <p className="text-[14px] text-muted-foreground">
          Your password has been changed.{" "}
          <Link to="/dashboard" className="font-medium text-primary hover:underline">
            Go to dashboard
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-[13px] text-destructive">
            {errors.form}
          </div>
        )}
        <div>
          <label htmlFor="password" className="block text-[13px] font-medium">New password</label>
          <input
            id="password" type="password" autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
            className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] focus:border-primary focus:outline-none"
            placeholder="Min. 8 characters"
          />
          <FieldError message={errors.password} />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-[13px] font-medium">Confirm password</label>
          <input
            id="confirm" type="password" autoComplete="new-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors({}); }}
            className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] focus:border-primary focus:outline-none"
            placeholder="Repeat new password"
          />
          <FieldError message={errors.confirm} />
        </div>
        <button
          type="submit" disabled={submitting}
          className="mt-2 h-11 w-full rounded-md bg-primary text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthCard>
  );
}
