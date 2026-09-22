import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, IndianRupee, ShieldCheck, Star } from "lucide-react";
import { AppShell } from "@/components/labfind/AppShell";
import {
  DashboardShell,
  StatRow,
  Panel,
  type DashboardSection,
} from "@/components/labfind/DashboardShell";
import { StageBadge } from "@/components/labfind/StatusTimeline";
import { allAppointments } from "@/lib/booking-store";
import { getLabById, formatINR } from "@/data/labs";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Lab console — requests, test menu and verification | LabFind" },
      {
        name: "description",
        content:
          "Approve appointment requests, maintain your test menu and prices, track reviews and complete platform verification.",
      },
      { property: "og:title", content: "Lab owner console — LabFind" },
      {
        property: "og:description",
        content: "Manage requests, pricing, verification and reviews for your laboratory.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LabConsole,
});

const SECTIONS: DashboardSection[] = [
  { id: "requests", label: "Requests", icon: CalendarCheck },
  { id: "menu", label: "Test menu", icon: ClipboardList },
  { id: "verification", label: "Verification", icon: ShieldCheck },
  { id: "reviews", label: "Reviews", icon: Star },
];

function LabConsole() {
  const [active, setActive] = useState("requests");
  const lab = getLabById("apex-diagnostics")!;
  const requests = allAppointments().filter((a) => a.stage !== "completed");
  const revenue = allAppointments().reduce((s, a) => s + a.total, 0);

  return (
    <AppShell>
      <DashboardShell
        eyebrow="Laboratory"
        title={lab.name}
        description={`${lab.area}, ${lab.city} — manage incoming requests, pricing and verification status.`}
        sections={SECTIONS}
        active={active}
        onSelect={setActive}
        actions={
          <span className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-[13px] font-medium">
            <ShieldCheck className="size-4 text-primary" strokeWidth={1.75} />
            Verified listing
          </span>
        }
      >
        <div className="space-y-6">
          <StatRow
            stats={[
              { label: "Pending requests", value: String(requests.length), note: "Awaiting action" },
              { label: "Tests listed", value: String(lab.tests.length) },
              { label: "Rating", value: lab.rating.toFixed(1), note: `${lab.reviewCount} reviews` },
              { label: "Booked value", value: formatINR(revenue), note: "Last 30 days" },
            ]}
          />

          {active === "requests" && (
            <Panel title="Appointment requests">
              <ul>
                {requests.map((a) => (
                  <li
                    key={a.id}
                    className="grid gap-3 border-b border-border py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="truncate text-[14px] font-semibold">{a.patientName}</p>
                        <StageBadge stage={a.stage} />
                      </div>
                      <p className="mt-1 text-[12.5px] text-muted-foreground">
                        {a.id} · {a.date} · {a.slot} ·{" "}
                        {a.mode === "home-collection" ? "Home collection" : "Lab visit"} ·{" "}
                        {formatINR(a.total)}
                      </p>
                      <p className="mt-1 truncate text-[12.5px] text-muted-foreground">
                        {a.tests.map((t) => t.name).join(", ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="h-9 rounded-md bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="h-9 rounded-md border border-border px-4 text-[13px] font-medium hover:bg-secondary"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {active === "menu" && (
            <Panel
              title="Test menu and pricing"
              action={
                <button
                  type="button"
                  className="text-[13px] font-medium text-primary hover:underline"
                >
                  Add test
                </button>
              }
            >
              <ul>
                {lab.tests.map((t) => (
                  <li
                    key={t.testId}
                    className="flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium">{t.labName}</p>
                      <p className="text-[12px] text-muted-foreground">
                        Report in {t.reportTimeHours} hrs
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold tabular-nums">
                      <IndianRupee className="size-3.5" strokeWidth={2} />
                      {t.price}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {active === "verification" && (
            <Panel title="Verification documents">
              <ul>
                {[
                  { label: "Clinical establishment registration", status: "Approved" },
                  { label: "NABL accreditation certificate", status: "Approved" },
                  { label: "Pathologist registration (MCI)", status: "Approved" },
                  { label: "Biomedical waste authorisation", status: "Expires in 24 days" },
                ].map((doc) => (
                  <li
                    key={doc.label}
                    className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
                  >
                    <p className="text-[13.5px]">{doc.label}</p>
                    <span className="shrink-0 text-[12.5px] font-medium text-muted-foreground">
                      {doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {active === "reviews" && (
            <Panel title="Patient reviews">
              <ul>
                {lab.reviews.map((r) => (
                  <li key={r.id} className="border-b border-border py-3 last:border-b-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[13.5px] font-semibold">{r.author}</p>
                      <p className="text-[12px] tabular-nums text-muted-foreground">
                        {r.rating}.0 ★ · {r.date}
                      </p>
                    </div>
                    <p className="mt-1 max-w-[70ch] text-[13px] leading-relaxed text-muted-foreground">
                      {r.body}
                    </p>
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
