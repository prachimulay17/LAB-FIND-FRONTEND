import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ClipboardList, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/labfind/AppShell";
import {
  DashboardShell,
  StatRow,
  Panel,
  type DashboardSection,
} from "@/components/labfind/DashboardShell";
import { LABS, formatINR } from "@/data/labs";
import { TEST_CATALOG } from "@/data/tests";
import { allAppointments } from "@/lib/booking-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — labs, verification and catalog | LabFind" },
      {
        name: "description",
        content:
          "Review laboratory listings, approve verification requests, curate the canonical test catalog and resolve patient complaints.",
      },
      { property: "og:title", content: "Platform admin console — LabFind" },
      {
        property: "og:description",
        content: "Verification queue, lab directory, test catalog and complaint handling.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminConsole,
});

const SECTIONS: DashboardSection[] = [
  { id: "verification", label: "Verification", icon: ShieldCheck },
  { id: "labs", label: "Laboratories", icon: Building2 },
  { id: "catalog", label: "Test catalog", icon: ClipboardList },
  { id: "complaints", label: "Complaints", icon: MessageSquareWarning },
];

const COMPLAINTS = [
  {
    id: "C-1042",
    subject: "Collector arrived 90 minutes late",
    lab: "Sahyadri Path Labs",
    raised: "2 days ago",
    status: "Open",
  },
  {
    id: "C-1039",
    subject: "Price differed from listed total",
    lab: "CityCare Diagnostics",
    raised: "4 days ago",
    status: "Under review",
  },
  {
    id: "C-1031",
    subject: "Report delayed beyond stated hours",
    lab: "Helix Metro Labs",
    raised: "1 week ago",
    status: "Resolved",
  },
];

function AdminConsole() {
  const [active, setActive] = useState("verification");
  const pending = LABS.filter((l) => !l.verified);
  const volume = allAppointments().reduce((s, a) => s + a.total, 0);

  return (
    <AppShell>
      <DashboardShell
        eyebrow="Platform admin"
        title="LabFind operations"
        description="Listing quality, verification and the canonical test catalog that keeps lab naming consistent."
        sections={SECTIONS}
        active={active}
        onSelect={setActive}
      >
        <div className="space-y-6">
          <StatRow
            stats={[
              { label: "Labs listed", value: String(LABS.length) },
              { label: "Pending verification", value: String(pending.length), note: "Needs review" },
              { label: "Canonical tests", value: String(TEST_CATALOG.length) },
              { label: "Booked value", value: formatINR(volume), note: "Across platform" },
            ]}
          />

          {active === "verification" && (
            <Panel title="Verification queue">
              {pending.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">Queue is clear.</p>
              ) : (
                <ul>
                  {pending.map((lab) => (
                    <li
                      key={lab.id}
                      className="grid gap-3 border-b border-border py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold">{lab.name}</p>
                        <p className="mt-1 text-[12.5px] text-muted-foreground">
                          {lab.area}, {lab.city} · {lab.tests.length} tests ·{" "}
                          {lab.accreditations.length || "no"} accreditation documents
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          className="h-9 rounded-md bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          className="h-9 rounded-md border border-border px-4 text-[13px] font-medium hover:bg-secondary"
                        >
                          Request docs
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {active === "labs" && (
            <Panel title="Laboratory directory">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="border-b border-border">
                      {["Laboratory", "Area", "Tests", "Rating", "Status"].map((h) => (
                        <th
                          key={h}
                          className="py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LABS.map((lab) => (
                      <tr key={lab.id} className="border-b border-border last:border-b-0">
                        <td className="py-2.5 text-[13.5px] font-medium">
                          <Link
                            to="/labs/$labId"
                            params={{ labId: lab.id }}
                            search={{ tests: "cbc", loc: "Pune, Maharashtra", mode: "lab-visit", budget: null }}
                            className="hover:text-primary"
                          >
                            {lab.name}
                          </Link>
                        </td>
                        <td className="py-2.5 text-[13px] text-muted-foreground">{lab.area}</td>
                        <td className="py-2.5 text-[13px] tabular-nums">{lab.tests.length}</td>
                        <td className="py-2.5 text-[13px] tabular-nums">
                          {lab.rating.toFixed(1)}
                        </td>
                        <td className="py-2.5 text-[12.5px] font-medium">
                          {lab.verified ? (
                            <span className="text-match-excellent">Verified</span>
                          ) : (
                            <span className="text-match-partial">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {active === "catalog" && (
            <Panel
              title="Canonical test catalog"
              action={
                <button
                  type="button"
                  className="text-[13px] font-medium text-primary hover:underline"
                >
                  Add canonical test
                </button>
              }
            >
              <ul>
                {TEST_CATALOG.map((test) => (
                  <li key={test.id} className="border-b border-border py-3 last:border-b-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="text-[13.5px] font-semibold">{test.name}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {test.category} · {test.sampleType} · {test.reportTimeHours} hrs
                      </p>
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">
                      Aliases: {test.aliases.join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {active === "complaints" && (
            <Panel title="Complaints">
              <ul>
                {COMPLAINTS.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium">{c.subject}</p>
                      <p className="text-[12.5px] text-muted-foreground">
                        {c.id} · {c.lab} · {c.raised}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12.5px] font-medium text-muted-foreground">
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </DashboardShell>
    </AppShell>
  );
}
