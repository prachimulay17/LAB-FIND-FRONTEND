import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { signIn } from "@/lib/api/auth";
import { AuthCard } from "./AuthCard";
import { FieldError } from "./FieldError";

interface Fields { email: string; password: string }
interface Errors {
  email?: string | undefined;
  password?: string | undefined;
  form?: string | undefined;
}

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.email.trim()) e.email = "Email is required.";
  if (!f.password) e.password = "Password is required.";
  return e;
}

export function LoginForm() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Fields>({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function set(key: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((f) => ({ ...f, [key]: e.target.value }));
      setErrors((err) => {
        const next: Errors = { ...err };
        delete next[key];
        delete next.form;
        return next;
      });
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    const { error } = await signIn(fields);
    setSubmitting(false);

    if (error) {
      setErrors({ form: "Incorrect email or password." });
      return;
    }
    void navigate({ to: "/dashboard" });
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back to LabFind."
      footer={
        <>
          No account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-[13px] text-destructive">
            {errors.form}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-[13px] font-medium">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={set("email")}
            className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="you@example.com"
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium">Password</label>
            <Link to="/reset-password" className="text-[12px] text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={fields.password}
            onChange={set("password")}
            className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Your password"
          />
          <FieldError message={errors.password} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 h-11 w-full rounded-md bg-primary text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
