/**
 * Shared card wrapper used by all auth forms.
 * Keeps the visual treatment consistent without depending on shadcn/card.
 */
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FlaskConical className="size-4.5" strokeWidth={1.75} />
          </span>
          <span className="text-[18px] font-bold tracking-tight">LabFind</span>
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <div className="mt-5 text-center text-[13px] text-muted-foreground">{footer}</div>
        )}
      </div>
    </div>
  );
}
