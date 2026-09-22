import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Heart, Search, MapPin, FileText } from "lucide-react";
import { AppShell } from "@/components/labfind/AppShell";
import {
  DashboardShell,
  StatRow,
  Panel,
  type DashboardSection,
} from "@/components/labfind/DashboardShell";
import { StageBadge } from "@/components/labfind/StatusTimeline";
import { allAppointments } from "@/lib/booking-store";
import { ADDRESSES, RECENT_SEARCHES, SAVED_LAB_IDS } from "@/data/appointments";
import { getLabById, formatINR } from "@/data/labs";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your appointments and saved labs — LabFind" },
      {
        name: "description",
        content:
          "Track diagnostic appointments, revisit recent searches, manage saved laboratories and collection addresses in one patient dashboard.",
      },
      { property: "og:title", content: "Patient dashboard — LabFind" },
      {
        property: "og:description",
        content: "Appointments, reports, saved labs and addresses in one place.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

const SECTIONS: DashboardSection[] = [
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "saved", label: "Saved labs", icon: Heart },
  { id: "searches", label: "Recent searches", icon: Search },
  { id: "addresses", label: "Addresses", icon: MapPin },
];

function DashboardPage() {
  const [active, setActive] = useState("appointments");
  const appointments = allAppointments();
  const upcoming = appointments.filter((a) => a.stage !== "completed");
  const completed = appointments.filter((a) => a.stage === "completed");

  return (
    <AppShell>
      <DashboardShell
        eyebrow="Patient"
        title="Prachi Mulay"
        description="Every appointment, report and saved laboratory tied to your account."
        sections={SECTIONS}
        active={active}
        onSelect={setActive}
        actions={
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-[14px] font-semibold text-primary-foreground hover:bg-primary/90"
          >
            New search
          </Link>
        }
      >
        <div className="space-y-6">
          <StatRow
            stats={[
              { label: "Active", value: String(upcoming.length), note: "In progress" },
              { label: "Completed", value: String(completed.length), note: "Reports ready" },
              { label: "Saved labs", value: String(SAVED_LAB_IDS.length) },
              {
                label: "Spent this year",
                value: formatINR(appointments.reduce((s, a) => s + a.total, 0)),
              },
            ]}
          />

          {active === "appointments" && (
            <Panel title="Appointments">
              <ul>
                {appointments.map((a) => (
                  <li
                    key={a.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-3.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Link
                          to="/appointments/$appointmentId"
                          params={{ appointmentId: a.id }}
                          className="truncate text-[14px] font-semibold hover:text-primary"
                        >
                          {a.labName}
                        </Link>
                        <StageBadge stage={a.stage} />
                      </div>
                      <p className="mt-1 text-[12.5px] text-muted-foreground">
                        {a.date} · {a.slot} ·{" "}
                        {a.mode === "home-collection" ? "Home collection" : "Lab visit"} ·{" "}
                        {a.tests.length} tests
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-semibold tabular-nums">
                        {formatINR(a.total)}
                      </p>
                      <Link
                        to="/appointments/$appointmentId"
                        params={{ appointmentId: a.id }}
                        className="text-[12px] font-medium text-primary hover:underline"
                      >
                        Track
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {active === "reports" && (
            <Panel title="Reports">
              {completed.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  No reports yet. They appear here once a lab uploads results.
                </p>
              ) : (
                <ul>
                  {completed.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium">
                          {a.tests.map((t) => t.name).join(", ")}
                        </p>
                        <p className="text-[12.5px] text-muted-foreground">
                          {a.labName} · {a.date}
                        </p>
                      </div>
                      <a
                        href="#"
                        className="shrink-0 text-[13px] font-medium text-primary hover:underline"
                      >
                        Download PDF
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {active === "saved" && (
            <Panel title="Saved labs">
              <ul>
                {SAVED_LAB_IDS.map((id) => {
                  const lab = getLabById(id);
                  if (!lab) return null;
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold">{lab.name}</p>
                        <p className="text-[12.5px] text-muted-foreground">
                          {lab.area} · {lab.distanceKm} km · {lab.rating.toFixed(1)} ★
                        </p>
                      </div>
                      <Link
                        to="/labs/$labId"
                        params={{ labId: lab.id }}
                        search={{ tests: "cbc", loc: "Pune, Maharashtra", mode: "lab-visit", budget: null }}
                        className="shrink-0 text-[13px] font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}

          {active === "searches" && (
            <Panel title="Recent searches">
              <ul>
                {RECENT_SEARCHES.map((s) => (
                  <li
                    key={s.tests}
                    className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium">
                        {s.tests.split(",").length} tests · {s.loc}
                      </p>
                      <p className="text-[12px] text-muted-foreground">{s.when}</p>
                    </div>
                    <Link
                      to="/results"
                      search={{
                        tests: s.tests,
                        loc: s.loc,
                        mode: "home-collection",
                        budget: null,
                      }}
                      className="shrink-0 text-[13px] font-medium text-primary hover:underline"
                    >
                      Run again
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {active === "addresses" && (
            <Panel title="Collection addresses">
              <ul>
                {ADDRESSES.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold">
                        {a.label}
                        {a.isDefault && (
                          <span className="ml-2 text-[11px] font-medium text-primary">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-[12.5px] text-muted-foreground">{a.line}</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-[13px] font-medium text-primary hover:underline"
                    >
                      Edit
                    </button>
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
