import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Target,
  FileText,
  CalendarCheck,
  ShieldCheck,
  Home,
  IndianRupee,
  MapPin,
  Star,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/labfind/Navbar";
import { SiteFooter } from "@/components/labfind/SiteFooter";
import { MatchScore } from "@/components/labfind/MatchScore";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — LabFind" },
      {
        name: "description",
        content:
          "Learn how LabFind helps you find and compare diagnostic labs by test availability, price, distance, home collection, and ratings — then book in minutes.",
      },
      { property: "og:title", content: "How LabFind Works" },
      {
        property: "og:description",
        content:
          "Compare diagnostic labs on what matters: test coverage, price, distance, home collection, and ratings.",
      },
    ],
  }),
  component: HowItWorksPage,
});

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Search for your diagnostic tests",
    body: "Enter one or more tests — CBC, lipid panel, HbA1c, thyroid profile — your city or area, whether you prefer a home visit or lab walk-in, and an optional budget. LabFind accepts common aliases so you never need to know the exact clinical name.",
    detail: [
      "Type test names in plain language",
      "Set location by city or pin code",
      "Choose lab visit or home collection",
      "Optionally cap your total budget",
    ],
  },
  {
    number: "02",
    icon: Target,
    title: "Compare matched laboratories",
    body: "Every lab in the network is scored against your specific criteria and ranked by match percentage. The score is computed from seven factors so you can see at a glance which lab fits your situation best — not just which one is closest.",
    detail: [
      "Test coverage — does the lab offer all your tests?",
      "Price fit — is the total within your budget?",
      "Distance — how far from your location?",
      "Collection mode — home visit available?",
      "Rating — based on verified patient reviews",
      "Availability — slot today or earliest slot",
      "Verification — registration and accreditation checked",
    ],
  },
  {
    number: "03",
    icon: FileText,
    title: "Review lab details",
    body: "Click any result to see the full picture before you commit. Each lab page shows itemised pricing for your selected tests, the complete test menu, operating hours, collection options, accreditation documents, and a breakdown of exactly why the lab scored the way it did.",
    detail: [
      "Itemised cost for every requested test",
      "Home collection fee and minimum order",
      "Operating hours and earliest available slot",
      "Accreditations: NABL, CAP, ISO",
      "Score breakdown — factor by factor",
      "Patient reviews and ratings",
    ],
  },
  {
    number: "04",
    icon: CalendarCheck,
    title: "Book your appointment",
    body: "When you've found the right lab, select your preferred date, time slot, and collection mode. Your request is sent to the lab for confirmation — nothing is auto-booked. Once confirmed, you'll be able to track the appointment from sample collection through to report delivery.",
    detail: [
      "Pick date and time slot",
      "Lab reviews and confirms the request",
      "Track status: booked → sample collected → report ready",
      "View all appointments from your dashboard",
    ],
  },
] as const;

const MATCH_FACTORS = [
  {
    icon: CheckCircle2,
    label: "Test coverage",
    description: "Whether the lab offers every test in your list, weighted heavily.",
  },
  {
    icon: IndianRupee,
    label: "Price fit",
    description: "How well the total cost fits within your stated budget.",
  },
  {
    icon: MapPin,
    label: "Distance",
    description: "Proximity to your entered location, in kilometres.",
  },
  {
    icon: Home,
    label: "Home collection",
    description: "Whether the lab can dispatch a collector to your address.",
  },
  {
    icon: Star,
    label: "Patient rating",
    description: "Average rating from verified patient reviews on the platform.",
  },
  {
    icon: CalendarCheck,
    label: "Availability",
    description: "Whether the lab has a slot today or the nearest possible slot.",
  },
  {
    icon: ShieldCheck,
    label: "Verification",
    description: "Registration and accreditation documents reviewed by LabFind.",
  },
] as const;

const SAMPLE_SCORE_REASONS = [
  { label: "All 4 requested tests available", met: true },
  { label: "Total ₹1,420 — within budget", met: true },
  { label: "Home collection available", met: true },
  { label: "3.2 km away in Kothrud", met: true },
  { label: "Rated 4.7 across 128 reviews", met: true },
  { label: "Earliest slot tomorrow, not today", met: false },
  { label: "NABL accreditation verified", met: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[700px] text-center">
            <p className="label-caps text-primary">How LabFind works</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.08] tracking-tight sm:text-[52px]">
              Find the Right Diagnostic Lab,<br className="hidden sm:block" /> With Confidence
            </h1>
            <p className="mx-auto mt-5 max-w-[52ch] text-[16px] leading-relaxed text-muted-foreground">
              LabFind compares diagnostic laboratories on test availability, pricing,
              distance, home collection, and patient ratings — so you can choose the lab
              that actually fits your needs before you book.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Find a Lab
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#process"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-6 text-[14px] font-medium transition-colors hover:bg-secondary"
              >
                Explore How It Works
                <ChevronDown className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step-by-step process ─────────────────────────────────────────── */}
      <section id="process" className="border-b border-border">
        <div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[560px] text-center">
            <p className="label-caps text-primary">The process</p>
            <h2 className="mt-3 text-[28px] font-bold tracking-tight sm:text-[34px]">
              From requirement to report, in four steps
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Every step is explicit. You see what a lab offers, what it costs, and what
              state your appointment is in.
            </p>
          </div>

          <div className="mt-14 space-y-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 1;
              return (
                <div
                  key={step.number}
                  className="grid gap-0 border-t border-border py-12 lg:grid-cols-2 lg:gap-16 lg:py-16"
                >
                  {/* Number + icon + heading — swaps side on even rows */}
                  <div className={isEven ? "lg:order-2" : ""}>
                    <div className="flex items-start gap-5">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary-soft">
                        <Icon className="size-5 text-primary" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0">
                        <p className="label-caps text-muted-foreground">{step.number}</p>
                        <h3 className="mt-1 text-[20px] font-bold tracking-tight sm:text-[22px]">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-5 max-w-[52ch] text-[14px] leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>

                  {/* Detail bullets */}
                  <div className={`mt-8 lg:mt-0 ${isEven ? "lg:order-1" : ""}`}>
                    <ul className="space-y-3 rounded-xl border border-border bg-surface p-6">
                      {step.detail.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-[13.5px]">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-match-excellent" strokeWidth={2} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Match score explainer ─────────────────────────────────────────── */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
            {/* Left: explanation */}
            <div>
              <p className="label-caps text-primary">The match score</p>
              <h2 className="mt-3 text-[28px] font-bold tracking-tight sm:text-[34px]">
                One number, seven factors
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
                Every lab is scored against your specific search — not a generic rating.
                The match percentage reflects how well that particular lab fits your
                tests, budget, location, and preferences. A lab with a lower overall
                rating can score higher than a 5-star lab if it covers your tests at a
                lower price and is 1 km closer.
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                The score is broken down factor by factor so you can see exactly where a
                lab gains or loses points. Nothing is hidden.
              </p>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {MATCH_FACTORS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li key={f.label} className="flex items-start gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                        <Icon className="size-4 text-primary" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold">{f.label}</p>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                          {f.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right: live score card sample */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-border bg-background p-6">
                <p className="label-caps">Sample result</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  CBC + Lipid Panel · Kothrud, Pune · Home collection · Budget ₹1,500
                </p>

                <div className="mt-5 flex items-start gap-5 rounded-lg border border-border bg-surface p-4">
                  <MatchScore score={94} />
                  <div className="min-w-0">
                    <p className="text-[16px] font-bold">Apex Diagnostics</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      4.7 ★ · 3.2 km · Kothrud
                    </p>
                    <p className="mt-1 text-[13px] font-semibold">₹1,420 total</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="label-caps mb-3">Why this score</p>
                  <ul className="space-y-2">
                    {SAMPLE_SCORE_REASONS.map((r) => (
                      <li key={r.label} className="flex items-center gap-2.5 text-[13px]">
                        {r.met ? (
                          <CheckCircle2 className="size-4 shrink-0 text-match-excellent" strokeWidth={2} />
                        ) : (
                          <div className="flex size-4 shrink-0 items-center justify-center">
                            <div className="size-1.5 rounded-full bg-muted-foreground" />
                          </div>
                        )}
                        <span className={r.met ? "text-foreground" : "text-muted-foreground"}>
                          {r.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tier legend */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    { label: "Excellent", color: "bg-match-excellent", range: "80–100%" },
                    { label: "Good", color: "bg-match-good", range: "65–79%" },
                    { label: "Partial", color: "bg-match-partial", range: "45–64%" },
                    { label: "Low", color: "bg-match-low", range: "0–44%" },
                  ] as const
                ).map((tier) => (
                  <div
                    key={tier.label}
                    className="rounded-md border border-border bg-surface px-3 py-2.5 text-center"
                  >
                    <div className={`mx-auto mb-1.5 size-2.5 rounded-full ${tier.color}`} />
                    <p className="text-[12px] font-semibold">{tier.label}</p>
                    <p className="text-[11px] text-muted-foreground">{tier.range}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── For lab owners ───────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <p className="label-caps text-primary">For laboratories</p>
              <h2 className="mt-3 text-[28px] font-bold tracking-tight sm:text-[34px]">
                Reach patients looking for exactly what you offer
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
                LabFind surfaces your lab to patients at the moment they are searching
                for the tests you perform. Your listing shows real-time pricing, home
                collection options, verified accreditation status, and your patient
                rating — giving patients the confidence to choose you.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Manage appointment requests from your lab dashboard",
                  "Maintain your test menu and update prices anytime",
                  "Display accreditation documents: NABL, CAP, ISO",
                  "Respond to patient reviews",
                  "Track verification status and document renewals",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[13.5px]">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-match-excellent" strokeWidth={2} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/lab"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-5 text-[14px] font-medium transition-colors hover:bg-secondary"
                >
                  Go to Lab Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <p className="label-caps">Lab dashboard highlights</p>
              <ul className="mt-4 divide-y divide-border">
                {[
                  { heading: "Appointment queue", sub: "Review, approve or decline incoming requests." },
                  { heading: "Test menu & pricing", sub: "Add or edit tests with prices and report times." },
                  { heading: "Verification centre", sub: "Upload and track accreditation documents." },
                  { heading: "Patient reviews", sub: "Monitor ratings and read feedback." },
                ].map((item) => (
                  <li key={item.heading} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft">
                      <ShieldCheck className="size-4 text-primary" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold">{item.heading}</p>
                      <p className="mt-0.5 text-[12.5px] text-muted-foreground">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1320px] px-5 py-16 text-center lg:px-10 lg:py-20">
          <p className="label-caps text-primary">Ready to start?</p>
          <h2 className="mt-3 text-[28px] font-bold tracking-tight sm:text-[36px]">
            Find your matched lab in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[14px] leading-relaxed text-muted-foreground">
            Enter your tests and location. LabFind scores every lab in the network
            against your criteria and shows you the best matches instantly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Find a Lab
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-6 text-[14px] font-medium transition-colors hover:bg-secondary"
            >
              Create an account
            </Link>
          </div>
          <p className="mt-5 text-[12px] text-muted-foreground">
            No sign-in required to search. Create a free account to save results and
            track appointments.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
