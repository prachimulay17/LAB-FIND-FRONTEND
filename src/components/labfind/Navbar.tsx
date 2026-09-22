import { Link } from "@tanstack/react-router";
import { Menu, X, FlaskConical } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Find a Lab", to: "/" },
  { label: "How it works", to: "/" },
  { label: "For Labs", to: "/" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-8 px-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5" aria-label="LabFind home">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FlaskConical className="size-4" strokeWidth={1.75} />
          </span>
          <span className="text-[17px] font-bold tracking-tight">LabFind</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <button
            type="button"
            className="rounded-md px-3 py-2 text-[14px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Login
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto rounded-md border border-border p-2 md:hidden"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-5 py-3 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-[15px] font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex gap-2 pb-2">
            <button
              type="button"
              className="flex-1 rounded-md border border-border px-4 py-2.5 text-[14px] font-medium"
            >
              Login
            </button>
            <button
              type="button"
              className="flex-1 rounded-md bg-primary px-4 py-2.5 text-[14px] font-semibold text-primary-foreground"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
