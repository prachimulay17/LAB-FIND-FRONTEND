import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { signUp } from "@/lib/api/auth";
import { AuthCard } from "./AuthCard";
import { FieldError } from "./FieldError";

interface Fields {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  fullName?: string | undefined;
  email?: string | undefined;
  password?: string | undefined;
  confirmPassword?: string | undefined;
  form?: string | undefined;
}

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (!fields.fullName.trim()) errors.fullName = "Full name is required.";
  if (!fields.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = "Enter a valid email address.";
  if (fields.password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  if (fields.confirmPassword !== fields.password)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function SignUpForm() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Fields>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
    const { error } = await signUp({
      email: fields.email,
      password: fields.password,
      fullName: fields.fullName,
    });
    setSubmitting(false);

    if (error) {
      setErrors({ form: error.message });
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <AuthCard title="Check your email">
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          We sent a confirmation link to <strong>{fields.email}</strong>. Click it to
          activate your account, then{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            sign in
          </Link>
          .
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Get matched with the right diagnostic lab."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
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
          <label htmlFor="fullName" className="block text-[13px] font-medium">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fields.fullName}
            onChange={set("fullName")}
            className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Prachi Mulay"
          />
          <FieldError message={errors.fullName} />
        </div>

        <div>
          <label htmlFor="email" className="block text-[13px] font-medium">
            Email
          </label>
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
          <label htmlFor="password" className="block text-[13px] font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={fields.password}
            onChange={set("password")}
            className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Min. 8 characters"
          />
          <FieldError message={errors.password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-[13px] font-medium">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={fields.confirmPassword}
            onChange={set("confirmPassword")}
            className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Repeat password"
          />
          <FieldError message={errors.confirmPassword} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 h-11 w-full rounded-md bg-primary text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
