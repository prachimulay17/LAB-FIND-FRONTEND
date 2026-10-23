import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, FlaskConical, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/api/auth";

const NAV_LINKS = [
  { label: "Find a Lab", to: "/" },
  { label: "How it works", to: "/" },
  { label: "For Labs", to: "/" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, profile, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    setUserMenuOpen(false);
    await signOut();
    void navigate({ to: "/" });
  }

  // Display name: profile full_name > email prefix > "Account"
  const displayName =
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Account";

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

        {/* Desktop auth area */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-secondary" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] font-medium transition-colors hover:bg-secondary"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <User className="size-3.5" strokeWidth={1.75} />
                {displayName}
              </button>
              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1.5 min-w-[180px] rounded-md border border-border bg-surface shadow-md"
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-secondary"
                  >
                    <LayoutDashboard className="size-3.5" strokeWidth={1.75} />
                    Dashboard
                  </Link>
                  <hr className="border-border" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-destructive hover:bg-destructive/8"
                  >
                    <LogOut className="size-3.5" strokeWidth={1.75} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-[14px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-primary px-4 py-2 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
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

      {/* Mobile drawer */}
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
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-border px-4 py-2.5 text-center text-[14px] font-medium"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => { setOpen(false); void handleSignOut(); }}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-[14px] font-semibold text-primary-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-border px-4 py-2.5 text-center text-[14px] font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-center text-[14px] font-semibold text-primary-foreground"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
