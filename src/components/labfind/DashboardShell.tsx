import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  eyebrow: string;
  title: string;
  description: string;
  sections: DashboardSection[];
  active: string;
  onSelect: (id: string) => void;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Shared dashboard frame for patient, lab-owner and admin consoles so the
 * three roles read as one product rather than three separate apps.
 */
export function DashboardShell({
  eyebrow,
  title,
  description,
  sections,
  active,
  onSelect,
  actions,
  children,
}: DashboardShellProps) {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 lg:px-10 lg:py-12">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-6 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="label-caps text-primary">{eyebrow}</p>
          <h1 className="mt-2 truncate text-[26px] font-bold tracking-tight sm:text-[30px]">
            {title}
          </h1>
          <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </header>

      <div className="grid gap-8 pt-6 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12">
        {/* Horizontal scroller on mobile, vertical rail on desktop. */}
        <nav
          aria-label={`${eyebrow} sections`}
          className="-mx-5 flex gap-1 overflow-x-auto border-b border-border px-5 pb-3 lg:mx-0 lg:flex-col lg:border-b-0 lg:border-r lg:px-0 lg:pb-0 lg:pr-4"
        >
          {sections.map((section) => {
            const isActive = section.id === active;
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors lg:w-full lg:justify-start",
                  isActive
                    ? "bg-primary-soft font-semibold text-primary"
                    : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                <span className="whitespace-nowrap">{section.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

/** Compact KPI row — numbers with context, never decorative stat cards. */
export function StatRow({
  stats,
}: {
  stats: { label: string; value: string; note?: string }[];
}) {
  return (
    <div className="grid border border-border bg-surface sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "px-5 py-4",
            i > 0 && "border-t border-border sm:border-t-0",
            i % 2 === 1 && "sm:border-l sm:border-border",
            i >= 2 && "sm:border-t sm:border-border lg:border-t-0",
            i === 2 && "lg:border-l lg:border-border",
            i === 3 && "lg:border-l lg:border-border",
          )}
        >
          <p className="label-caps">{stat.label}</p>
          <p className="mt-2 text-[24px] font-bold tabular-nums leading-none">{stat.value}</p>
          {stat.note && <p className="mt-1.5 text-[12px] text-muted-foreground">{stat.note}</p>}
        </div>
      ))}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border bg-surface", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
