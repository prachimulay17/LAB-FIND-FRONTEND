import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Phone, MapPin, Download, CalendarClock } from "lucide-react";
import { AppShell } from "@/components/labfind/AppShell";
import { StatusTimeline, StageBadge } from "@/components/labfind/StatusTimeline";
import { findAppointment } from "@/lib/booking-store";
import { formatINR } from "@/data/labs";

export const Route = createFileRoute("/appointments/$appointmentId")({
  loader: ({ params }) => {
    const appointment = findAppointment(params.appointmentId);
    if (!appointment) throw notFound();
    return { appointment };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Appointment ${loaderData.appointment.id} — LabFind`
          : "Appointment — LabFind",
      },
      {
        name: "description",
        content:
          "Track your diagnostic appointment from request and approval to collector assignment, sample collection and report readiness.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackingPage,
});

function TrackingPage() {
  const { appointment } = Route.useLoaderData();

  return (
    <AppShell>
      <div className="mx-auto max-w-[1320px] px-5 py-7 lg:px-10 lg:py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>

        <header className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-6 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <p className="label-caps text-primary">Appointment {appointment.id}</p>
            <h1 className="mt-2 truncate text-[26px] font-bold tracking-tight sm:text-[30px]">
              {appointment.labName}
            </h1>
            <p className="mt-1.5 text-[14px] text-muted-foreground">
              {appointment.date} · {appointment.slot} ·{" "}
              {appointment.mode === "home-collection" ? "Home collection" : "Lab visit"}
            </p>
          </div>
          <StageBadge stage={appointment.stage} />
        </header>

        <div className="grid gap-10 pt-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <section className="min-w-0">
            <h2 className="text-[16px] font-bold tracking-tight">Progress</h2>
            <div className="mt-5">
              <StatusTimeline appointment={appointment} />
            </div>
          </section>

          <aside className="space-y-6">
            {appointment.collector && (
              <div className="border border-border bg-surface p-5">
                <p className="label-caps">Assigned collector</p>
                <p className="mt-2.5 text-[15px] font-semibold">
                  {appointment.collector.name}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Arriving in {appointment.collector.eta}
                </p>
                <a
                  href="tel:+910000000000"
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-[13px] font-medium hover:bg-secondary"
                >
                  <Phone className="size-3.5" strokeWidth={1.75} />
                  {appointment.collector.phone}
                </a>
              </div>
            )}

            <div className="border border-border bg-surface p-5">
              <p className="label-caps">
                {appointment.mode === "home-collection" ? "Collection address" : "Lab address"}
              </p>
              <p className="mt-2.5 flex gap-2 text-[13px] leading-relaxed text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
                {appointment.address ?? `${appointment.labName}, ${appointment.labArea}, Pune`}
              </p>
              <p className="mt-3 flex gap-2 border-t border-border pt-3 text-[13px] text-muted-foreground">
                <CalendarClock className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
                {appointment.date}, {appointment.slot}
              </p>
            </div>

            <div className="border border-border bg-surface">
              <p className="label-caps border-b border-border px-5 py-3">Tests and pricing</p>
              <ul className="px-5 py-2">
                {appointment.tests.map((t) => (
                  <li
                    key={t.testId}
                    className="flex justify-between border-b border-border py-2 text-[13px] last:border-b-0"
                  >
                    <span>{t.name}</span>
                    <span className="tabular-nums">{formatINR(t.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1.5 border-t border-border px-5 py-3 text-[13px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Collection fee</span>
                  <span className="tabular-nums">
                    {appointment.collectionFee === 0
                      ? "Included"
                      : formatINR(appointment.collectionFee)}
                  </span>
                </div>
                <div className="flex justify-between text-[15px] font-bold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatINR(appointment.total)}</span>
                </div>
              </div>
            </div>

            {appointment.stage === "completed" ? (
              <a
                href="#"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-[14px] font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Download className="size-4" strokeWidth={1.75} />
                Download report
              </a>
            ) : (
              <button
                type="button"
                className="h-10 w-full rounded-md border border-border text-[14px] font-medium hover:bg-secondary"
              >
                Reschedule or cancel
              </button>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
