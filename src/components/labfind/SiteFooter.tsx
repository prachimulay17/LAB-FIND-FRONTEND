import { Link } from "@tanstack/react-router";

const COLUMNS = [
  {
    title: "Patients",
    links: [
      { label: "Find a lab", to: "/" },
      { label: "Search results", to: "/results" },
      { label: "My dashboard", to: "/dashboard" },
    ],
  },
  {
    title: "Laboratories",
    links: [
      { label: "Lab dashboard", to: "/lab" },
      { label: "Appointments", to: "/lab" },
      { label: "Verification", to: "/lab" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Admin console", to: "/admin" },
      { label: "Test catalog", to: "/admin" },
      { label: "Complaints", to: "/admin" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_repeat(3,auto)] lg:gap-16">
          <div className="max-w-[34ch]">
            <p className="text-[15px] font-bold tracking-tight">LabFind</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Diagnostic laboratory discovery, comparison and appointments. Match scores
              are computed from test coverage, price, distance, collection mode, rating,
              availability and verification.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="label-caps">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-9 flex flex-col gap-2 border-t border-border pt-5 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LabFind. Demo build — lab data and match scores are illustrative.</p>
          <p>Pune, Maharashtra</p>
        </div>
      </div>
    </footer>
  );
}
