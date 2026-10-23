import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowLeft, Building2, Home, Check, Info } from "lucide-react";
import { AppShell } from "@/components/labfind/AppShell";
import { getLabById, formatINR } from "@/data/labs";
import { getTestById } from "@/data/tests";
import { matchLab, type CollectionMode } from "@/lib/scoring";
import { toCriteria, validateResultsSearch, type ResultsSearch } from "@/lib/search-params";
import { ADDRESSES, TIME_SLOTS, type Appointment } from "@/data/appointments";
import { addAppointment, nextAppointmentId } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/api/auth";

export const Route = createFileRoute("/book/$labId")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) throw redirect({ to: "/login" });
  },
  validateSearch: (raw: Record<string, unknown>): ResultsSearch => validateResultsSearch(raw),
  loader: ({ params }) => {
    const lab = getLabById(params.labId);
    if (!lab) throw notFound();
    return { lab };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.lab.name ?? "laboratory";
    return {
      meta: [
        { title: `Request an appointment at ${name} — LabFind` },
        {
          name: "description",
          content: `Choose lab visit or home collection, pick a date and slot, and review the full price before requesting an appointment at ${name}.`,
        },
        { property: "og:title", content: `Book ${name} — LabFind` },
        {
          property: "og:description",
          content: "Review tests, collection fee and total before sending the request.",
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: BookingPage,
});

function nextDates(count: number) {
  const base = new Date("2026-08-13T00:00:00Z");
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
      day: d.toLocaleDateString("en-IN", { day: "2-digit", timeZone: "UTC" }),
      month: d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
      label: d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    };
  });
}

function BookingPage() {
  const { lab } = Route.useLoaderData();
  const search = Route.useSearch();
  const criteria = toCriteria(search);
  const match = matchLab(lab, criteria);
  const dates = useMemo(() => nextDates(7), []);

  const [mode, setMode] = useState<CollectionMode>(
    lab.homeCollection ? criteria.collection : "lab-visit",
  );
  const [addressId, setAddressId] = useState(ADDRESSES[0]!.id);
  const [customAddress, setCustomAddress] = useState("");
  const [date, setDate] = useState(dates[0]!.key);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);

  const collectionFee =
    mode === "home-collection" && match.subtotal < lab.homeCollectionMinOrder
      ? lab.homeCollectionFee
      : 0;
  const total = match.subtotal + collectionFee;
  const selectedDate = dates.find((d) => d.key === date)!;
  const address =
    addressId === "other"
      ? customAddress
      : (ADDRESSES.find((a) => a.id === addressId)?.line ?? "");
  const canSubmit =
    Boolean(slot) && (mode === "lab-visit" || address.trim().length > 6);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const appointment: Appointment = {
      id: nextAppointmentId(),
      labId: lab.id,
      labName: lab.name,
      labArea: lab.area,
      patientName: "Prachi Mulay",
      mode,
      ...(mode === "home-collection" ? { address } : {}),
      date: selectedDate.label,
      slot: slot!,
      tests: match.covered.map((t) => ({
        testId: t.testId,
        name: getTestById(t.testId)?.name ?? t.labName,
        price: t.price,
      })),
      subtotal: match.subtotal,
      collectionFee,
      total,
      stage: "requested",
      events: [{ stage: "requested", at: "Just now", note: "Waiting for the lab to confirm." }],
    };
    addAppointment(appointment);
    setConfirmed(appointment);
  };

  if (confirmed) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[720px] px-5 py-14 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-match-excellent/12 text-match-excellent">
              <Check className="size-5" strokeWidth={2.25} />
            </span>
            <div>
              <h1 className="text-[24px] font-bold tracking-tight">Request sent</h1>
              <p className="text-[13px] text-muted-foreground">
                Reference {confirmed.id} · nothing is charged until the lab confirms.
              </p>
            </div>
          </div>

          <div className="mt-7 border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold">{confirmed.labName}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {confirmed.mode === "home-collection"
                  ? `Home collection · ${confirmed.address}`
                  : `Lab visit · ${lab.addressLine}`}
              </p>
              <p className="mt-2 text-[13px]">
                {confirmed.date} · {confirmed.slot}
              </p>
            </div>
            <ul className="px-5 py-3">
              {confirmed.tests.map((t) => (
                <li
                  key={t.testId}
                  className="flex justify-between border-b border-border py-2 text-[13px] last:border-b-0"
                >
                  <span>{t.name}</span>
                  <span className="tabular-nums">{formatINR(t.price)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-border px-5 py-3 text-[15px] font-bold">
              <span>Total payable</span>
              <span className="tabular-nums">{formatINR(confirmed.total)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/appointments/$appointmentId"
              params={{ appointmentId: confirmed.id }}
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-[14px] font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Track this appointment
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex h-10 items-center rounded-md border border-border px-5 text-[14px] font-medium hover:bg-secondary"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1320px] px-5 py-7 lg:px-10 lg:py-10">
        <Link
          to="/labs/$labId"
          params={{ labId: lab.id }}
          search={search}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to {lab.name}
        </Link>

        <h1 className="mt-4 text-[28px] font-bold tracking-tight sm:text-[32px]">
          Request an appointment
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-[14px] text-muted-foreground">
          The lab reviews every request before confirming — slots are never
          auto-booked, and the price you see is the price you pay.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12"
        >
          <div className="min-w-0 space-y-8">
            <section>
              <h2 className="text-[15px] font-semibold">1 · Collection method</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(["lab-visit", "home-collection"] as CollectionMode[]).map((option) => {
                  const disabled = option === "home-collection" && !lab.homeCollection;
                  const Icon = option === "lab-visit" ? Building2 : Home;
                  const active = mode === option;
                  return (
                    <label
                      key={option}
                      className={cn(
                        "flex cursor-pointer gap-3 border p-4 transition-colors",
                        active ? "border-primary bg-primary-soft" : "border-border bg-surface",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <input
                        type="radio"
                        name="mode"
                        className="sr-only"
                        checked={active}
                        disabled={disabled}
                        onChange={() => setMode(option)}
                      />
                      <Icon
                        className={cn("mt-0.5 size-4 shrink-0", active && "text-primary")}
                        strokeWidth={1.75}
                      />
                      <div>
                        <p className="text-[14px] font-semibold">
                          {option === "lab-visit" ? "Lab visit" : "Home collection"}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {option === "lab-visit"
                            ? lab.addressLine
                            : lab.homeCollection
                              ? `${formatINR(lab.homeCollectionFee)} fee, waived above ${formatINR(lab.homeCollectionMinOrder)}`
                              : "Not offered by this lab"}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {mode === "home-collection" && (
              <section>
                <h2 className="text-[15px] font-semibold">2 · Collection address</h2>
                <div className="mt-3 space-y-2">
                  {ADDRESSES.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 border p-3.5",
                        addressId === a.id
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-surface",
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 size-4 accent-[var(--primary)]"
                        checked={addressId === a.id}
                        onChange={() => setAddressId(a.id)}
                      />
                      <div>
                        <p className="text-[13px] font-semibold">{a.label}</p>
                        <p className="text-[12px] text-muted-foreground">{a.line}</p>
                      </div>
                    </label>
                  ))}
                  <label
                    className={cn(
                      "block cursor-pointer border p-3.5",
                      addressId === "other"
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-surface",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="address"
                        className="size-4 accent-[var(--primary)]"
                        checked={addressId === "other"}
                        onChange={() => setAddressId("other")}
                      />
                      <span className="text-[13px] font-semibold">Another address</span>
                    </span>
                    {addressId === "other" && (
                      <textarea
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        rows={2}
                        placeholder="Flat / building, street, area, pincode"
                        className="mt-3 w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px]"
                      />
                    )}
                  </label>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-[15px] font-semibold">
                {mode === "home-collection" ? "3" : "2"} · Date
              </h2>
              <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {dates.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDate(d.key)}
                    className={cn(
                      "flex w-[70px] shrink-0 flex-col items-center gap-0.5 border py-2.5 text-[12px] transition-colors",
                      date === d.key
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-surface hover:bg-secondary",
                    )}
                  >
                    <span className="uppercase tracking-wide">{d.weekday}</span>
                    <span className="text-[17px] font-bold tabular-nums leading-none">
                      {d.day}
                    </span>
                    <span className="text-muted-foreground">{d.month}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[15px] font-semibold">
                {mode === "home-collection" ? "4" : "3"} · Time slot
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {TIME_SLOTS.map((s, i) => {
                  const unavailable = i === 2 || i === 7;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={unavailable}
                      onClick={() => setSlot(s)}
                      className={cn(
                        "border py-2 text-[12.5px] tabular-nums transition-colors",
                        slot === s
                          ? "border-primary bg-primary-soft font-semibold text-primary"
                          : "border-border bg-surface hover:bg-secondary",
                        unavailable &&
                          "cursor-not-allowed border-dashed text-muted-foreground line-through hover:bg-surface",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {!slot && (
                <p className="mt-2.5 text-[12px] text-muted-foreground">
                  Select a slot to continue. Struck-through slots are already full.
                </p>
              )}
            </section>

            <section>
              <h2 className="text-[15px] font-semibold">Notes for the lab</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Prescription reference, mobility needs, preferred phlebotomist gender…"
                className="mt-3 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[13px]"
              />
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <p className="text-[15px] font-semibold">{lab.name}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {lab.area} · {lab.distanceKm} km · {lab.rating.toFixed(1)} ★
                </p>
              </div>
              <ul className="px-5 py-3">
                {match.covered.map((t) => (
                  <li
                    key={t.testId}
                    className="flex justify-between gap-4 border-b border-border py-2 text-[13px] last:border-b-0"
                  >
                    <span className="min-w-0">{t.labName}</span>
                    <span className="shrink-0 tabular-nums">{formatINR(t.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1.5 border-t border-border px-5 py-3 text-[13px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatINR(match.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Collection fee</span>
                  <span className="tabular-nums">
                    {collectionFee === 0 ? "Included" : formatINR(collectionFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-[16px] font-bold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatINR(total)}</span>
                </div>
              </div>
              {match.missingTestIds.length > 0 && (
                <p className="border-t border-border bg-match-partial/8 px-5 py-3 text-[12px] text-foreground">
                  {match.missingTestIds.length} requested test
                  {match.missingTestIds.length === 1 ? " is" : "s are"} not offered here and
                  {match.missingTestIds.length === 1 ? " has" : " have"} been excluded.
                </p>
              )}
              <div className="border-t border-border p-5">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="h-11 w-full rounded-md bg-primary text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send appointment request
                </button>
                <p className="mt-3 flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
                  The lab confirms availability before the slot is held. You will be
                  notified at each stage.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </AppShell>
  );
}
