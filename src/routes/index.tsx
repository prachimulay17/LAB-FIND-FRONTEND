import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Target, IndianRupee, Home, Search, CalendarCheck, FileText } from "lucide-react";
import { Navbar } from "@/components/labfind/Navbar";
import { SearchPanel } from "@/components/labfind/SearchPanel";
import { MatchScore, MatchBreakdown, MatchLegend } from "@/components/labfind/MatchScore";
import heroImage from "@/assets/lab-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LabFind — Compare diagnostic labs by tests, price and distance" },
      {
        name: "description",
        content:
          "Compare verified diagnostic laboratories on test availability, price, distance and home sample collection, then book an appointment.",
      },
      { property: "og:title", content: "LabFind — Find the lab that fits your needs" },
      {
        property: "og:description",
        content:
          "Compare tests, prices, locations and collection options across verified diagnostic labs before you book.",
      },
    ],
  }),
  component: Index,
});

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Verified labs",
    body: "Registration and accreditation documents are reviewed before a lab is listed.",
  },
  {
    icon: Target,
    title: "Best match",
    body: "Labs are scored against your tests, budget, distance and collection preference.",
  },
  {
    icon: IndianRupee,
    title: "Transparent pricing",
    body: "See the price of every requested test and the total before you book.",
  },
  {
    icon: Home,
    title: "Home collection",
    body: "Filter for labs that collect samples at your doorstep, with charges shown upfront.",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "Tell us what you need",
    body: "Add your tests, location, budget and whether you prefer a lab visit or home collection.",
  },
  {
    icon: Target,
    title: "Compare matched labs",
    body: "Results and map stay in sync, each lab scored on availability, price, distance and rating.",
  },
  {
    icon: CalendarCheck,
    title: "Request an appointment",
    body: "Pick a date and slot. The lab reviews the request and confirms it — nothing is auto-booked.",
  },
  {
    icon: FileText,
    title: "Track collection",
    body: "Follow the appointment from approval to sample collection and report readiness.",
  },
];

const SAMPLE_REASONS = [
  { label: "All 4 requested tests available", met: true },
  { label: "Total ₹1,420 — within budget", met: true },
  { label: "Home collection available", met: true },
  { label: "3.2 km away in Kothrud", met: true },
  { label: "Rated 4.7 across 128 reviews", met: true },
  { label: "Earliest slot is tomorrow, not today", met: false },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Search-first hero: the search panel is the product, not marketing copy. */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14 lg:px-10 lg:py-16">
            <div className="max-w-[640px]">
              <p className="label-caps text-primary">Diagnostic lab discovery</p>
              <h1 className="mt-4 text-[38px] leading-[1.05] font-bold tracking-tight sm:text-[52px]">
                Find the lab that
                <br className="hidden sm:block" /> fits your needs.
              </h1>
              <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-muted-foreground">
                Compare tests, prices, locations and collection options across verified
                laboratories before you book. Not just the nearest lab — the right one.
              </p>

              <div className="mt-8">
                <SearchPanel />
              </div>
            </div>

            <aside className="hidden lg:block">
              <img
                src={heroImage}
                alt="Blood sample tubes on a laboratory bench beside a microscope"
                width={1200}
                height={1008}
                className="h-[280px] w-full rounded-xl border border-border object-cover"
              />
              <div className="mt-6 rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start gap-4">
                  <MatchScore score={94} />
                  <div className="min-w-0">
                    <h2 className="text-[16px] font-semibold">Apex Diagnostics</h2>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      4.7 ★ (128) · 3.2 km · Kothrud
                    </p>
                    <p className="mt-1 text-[13px] font-semibold tabular-nums">₹1,420 total</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="label-caps">Why this score</p>
                  <MatchBreakdown reasons={SAMPLE_REASONS} className="mt-3 sm:grid-cols-1" />
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <MatchLegend />
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Sample result shown while the matching service is being connected.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* Compact benefit strip — dividers, not four decorative cards. */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto grid max-w-[1320px] px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
            {BENEFITS.map((benefit, i) => (
              <div
                key={benefit.title}
                className={[
                  "py-7 lg:py-8",
                  i > 0 ? "border-t border-border sm:pl-7 lg:pl-8" : "",
                  i > 0 ? "sm:border-l" : "",
                  i === 1 ? "sm:border-t-0" : "",
                  i >= 2 ? "lg:border-t-0" : "",
                  i === 2 ? "sm:border-l-0 lg:border-l" : "",
                  i < 3 ? "sm:pr-7 lg:pr-8" : "",
                ].join(" ")}
              >
                <benefit.icon className="size-[18px] text-primary" strokeWidth={1.5} />
                <h3 className="mt-3 text-[14px] font-semibold">{benefit.title}</h3>
                <p className="mt-1.5 max-w-[34ch] text-[13px] leading-relaxed text-muted-foreground">
                  {benefit.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-14 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="label-caps text-primary">How it works</p>
              <h2 className="mt-3 text-[28px] leading-tight font-bold tracking-tight">
                From requirement to sample collection.
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                Every step is explicit: you see what a lab offers, what it costs and what
                state your appointment is actually in.
              </p>
            </div>

            <ol className="grid sm:grid-cols-2">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className={[
                    "border-t border-border py-6 sm:py-7",
                    i % 2 === 1 ? "sm:border-l sm:pl-7" : "sm:pr-7",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold tabular-nums text-muted-foreground">
                      0{i + 1}
                    </span>
                    <step.icon className="size-[18px] text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold">{step.title}</h3>
                  <p className="mt-1.5 max-w-[42ch] text-[13px] leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-5 py-8 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>LabFind — diagnostic laboratory discovery and appointments.</p>
          <p>Demo build. Lab data and match scores shown are illustrative.</p>
        </div>
      </footer>
    </div>
  );
}
