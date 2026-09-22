import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin,
  Clock,
  Home,
  Building2,
  Star,
  ShieldCheck,
  ArrowLeft,
  Award,
} from "lucide-react";
import { AppShell } from "@/components/labfind/AppShell";
import { MatchScore, MatchBreakdown } from "@/components/labfind/MatchScore";
import { VerifiedBadge } from "@/components/labfind/LabCard";
import { getLabById, formatINR } from "@/data/labs";
import { getTestById } from "@/data/tests";
import { matchLab } from "@/lib/scoring";
import { toCriteria, validateResultsSearch, type ResultsSearch } from "@/lib/search-params";

export const Route = createFileRoute("/labs/$labId")({
  validateSearch: (raw: Record<string, unknown>): ResultsSearch => validateResultsSearch(raw),
  loader: ({ params }) => {
    const lab = getLabById(params.labId);
    if (!lab) throw notFound();
    return { lab };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Laboratory unavailable — LabFind" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { lab } = loaderData;
    const title = `${lab.name}, ${lab.area} — tests, prices and appointments | LabFind`;
    const description = `${lab.name} in ${lab.area}, ${lab.city}. ${lab.tagline}. Rated ${lab.rating.toFixed(1)} across ${lab.reviewCount} reviews.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: LabDetailPage,
});

function LabDetailPage() {
  const { lab } = Route.useLoaderData();
  const search = Route.useSearch();
  const criteria = toCriteria(search);
  const match = matchLab(lab, criteria);

  return (
    <AppShell>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1320px] px-5 py-6 lg:px-10 lg:py-9">
          <Link
            to="/results"
            search={search}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to results
          </Link>

          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="text-[28px] font-bold tracking-tight sm:text-[34px]">
                  {lab.name}
                </h1>
                <VerifiedBadge verified={lab.verified} />
              </div>
              <p className="mt-1.5 max-w-[60ch] text-[14px] leading-relaxed text-muted-foreground">
                {lab.tagline}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" strokeWidth={1.75} />
                  {lab.addressLine} · {lab.distanceKm} km away
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" strokeWidth={1.75} />
                  Today {lab.openToday}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-match-partial text-match-partial" strokeWidth={0} />
                  <span className="font-semibold text-foreground">
                    {lab.rating.toFixed(1)}
                  </span>
                  ({lab.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:flex-col lg:items-end">
              <MatchScore score={match.score} />
              <Link
                to="/book/$labId"
                params={{ labId: lab.id }}
                search={search}
                className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Book appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 lg:px-10 lg:py-12">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="text-[18px] font-bold tracking-tight">Your selected tests</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Prices as listed by the lab for the tests in your search.
            </p>
            <div className="mt-4 border border-border bg-surface">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Test
                    </th>
                    <th className="hidden px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                      Report in
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.testIds.map((id) => {
                    const canonical = getTestById(id);
                    const priced = match.covered.find((t) => t.testId === id);
                    return (
                      <tr key={id} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3">
                          <p className="text-[14px] font-medium">
                            {priced?.labName ?? canonical?.name ?? id}
                          </p>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">
                            {canonical?.sampleType ?? "Sample"} ·{" "}
                            {canonical?.fastingRequired
                              ? (canonical.preparation ?? "Fasting required")
                              : "No preparation needed"}
                          </p>
                        </td>
                        <td className="hidden px-4 py-3 text-[13px] tabular-nums text-muted-foreground sm:table-cell">
                          {priced ? `${priced.reportTimeHours} hrs` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-[14px] font-semibold tabular-nums">
                          {priced ? (
                            formatINR(priced.price)
                          ) : (
                            <span className="text-[12px] font-medium text-match-low">
                              Not offered
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-secondary/60">
                    <td className="px-4 py-3 text-[13px] font-semibold" colSpan={2}>
                      Total for available tests
                      {match.collectionFee > 0 &&
                        ` (incl. ${formatINR(match.collectionFee)} home collection)`}
                    </td>
                    <td className="px-4 py-3 text-right text-[16px] font-bold tabular-nums">
                      {formatINR(match.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-tight">Full test menu</h2>
            <ul className="mt-4 grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {lab.tests.map((t) => (
                <li
                  key={t.testId}
                  className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 text-[13px]"
                >
                  <span className="min-w-0 truncate">{t.labName}</span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatINR(t.price)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-[18px] font-bold tracking-tight">Facilities</h2>
              <ul className="mt-3 space-y-2">
                {lab.facilities.map((f) => (
                  <li key={f} className="text-[13px] text-muted-foreground">
                    · {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[18px] font-bold tracking-tight">Accreditations</h2>
              {lab.accreditations.length ? (
                <ul className="mt-3 space-y-2">
                  {lab.accreditations.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-[13px]">
                      <Award className="size-4 text-primary" strokeWidth={1.75} />
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 max-w-[38ch] text-[13px] text-muted-foreground">
                  No accreditation documents on file. This listing is marked
                  verification pending and is scored lower.
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-tight">
              Reviews
              <span className="ml-2 text-[13px] font-medium text-muted-foreground">
                {lab.rating.toFixed(1)} average · {lab.reviewCount} total
              </span>
            </h2>
            <ul className="mt-4">
              {lab.reviews.map((review) => (
                <li key={review.id} className="border-t border-border py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[14px] font-semibold">{review.author}</p>
                    <p className="text-[12px] text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5" aria-label={`${review.rating} of 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={
                          i < review.rating
                            ? "size-3.5 fill-match-partial text-match-partial"
                            : "size-3.5 fill-border text-border"
                        }
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <p className="mt-2 max-w-[64ch] text-[13px] leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-border bg-surface p-5">
            <p className="label-caps">Why this lab scored {match.score}%</p>
            <MatchBreakdown reasons={match.reasons} className="mt-3 sm:grid-cols-1" />
          </div>

          <div className="border border-border bg-surface p-5">
            <p className="label-caps">Collection options</p>
            <ul className="mt-3 space-y-3">
              <li className="flex gap-3">
                <Building2 className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} />
                <div>
                  <p className="text-[13px] font-semibold">Lab visit</p>
                  <p className="text-[12px] text-muted-foreground">
                    Walk-in and pre-booked slots at {lab.area}.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Home className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} />
                <div>
                  <p className="text-[13px] font-semibold">
                    {lab.homeCollection ? "Home collection" : "Home collection unavailable"}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {lab.homeCollection
                      ? `${formatINR(lab.homeCollectionFee)} fee, waived above ${formatINR(lab.homeCollectionMinOrder)}.`
                      : "This lab collects samples at the centre only."}
                  </p>
                </div>
              </li>
            </ul>
            <p className="mt-4 border-t border-border pt-3 text-[12px] text-muted-foreground">
              Earliest slot: <span className="font-semibold text-foreground">{lab.earliestSlot}</span>
            </p>
          </div>

          <div className="border border-border bg-surface p-5">
            <p className="label-caps">Operating hours</p>
            <ul className="mt-3">
              {lab.hours.map((h) => (
                <li
                  key={h.day}
                  className="flex justify-between border-b border-border py-1.5 text-[13px] last:border-b-0"
                >
                  <span className="text-muted-foreground">{h.day}</span>
                  <span className="tabular-nums">{h.open}</span>
                </li>
              ))}
            </ul>
          </div>

          {lab.verified && (
            <div className="flex gap-3 border border-border bg-primary-soft p-4">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} />
              <p className="text-[12px] leading-relaxed text-primary">
                Registration and accreditation documents were reviewed by the LabFind
                verification team.
              </p>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
