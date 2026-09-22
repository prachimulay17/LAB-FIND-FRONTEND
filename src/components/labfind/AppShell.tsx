import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";

/** Single page frame so every route reads as the same product. */
export function AppShell({
  children,
  footer = true,
}: {
  children: ReactNode;
  footer?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      {footer && <SiteFooter />}
    </div>
  );
}
