import { Link } from "@tanstack/react-router";
import { Star, ShieldCheck, MapPin, Home, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResultsSearch } from "@/lib/search-params";
import { formatINR } from "@/data/labs";
import { getTestById } from "@/data/tests";
import type { MatchedLab } from "@/lib/scoring";
import { MatchScore, MatchBreakdown } from "./MatchScore";

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary">
      <ShieldCheck className="size-3.5" strokeWidth={1.75} />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-match-partial">
      <ShieldCheck className="size-3.5" strokeWidth={1.75} />
      Verification pending
    </span>
  );
}

export function RatingInline({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
      <Star className="size-3.5 fill-match-partial text-match-partial" strokeWidth={0} />
      <span className="font-semibold tabular-nums text-foreground">{rating.toFixed(1)}</span>
      <span className="tabular-nums">({count})</span>
    </span>
  );
}

interface LabCardProps {
  match: MatchedLab;
  testIds: string[];
  active?: boolean;
  onHover?: (labId: string | null) => void;
  onSelect?: (labId: string) => void;
  bookSearch: ResultsSearch;
}

/** Result row: score, coverage, price and the reasons behind the score. */
export function LabCard({
  match,
  testIds,
  active,
  onHover,
  onSelect,
  bookSearch,
}: LabCardProps) {
  const { lab } = match;

  return (
    <article
      onMouseEnter={() => onHover?.(lab.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect?.(lab.id)}
      className={cn(
        "border-b border-border bg-surface px-4 py-5 transition-colors sm:px-6",
        active ? "bg-primary-soft/40" : "hover:bg-secondary/60",
      )}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
        <MatchScore score={match.score} className="shrink-0" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <h3 className="truncate text-[17px] font-bold tracking-tight">
                <Link
                  to="/labs/$labId"
                  params={{ labId: lab.id }}
                  search={bookSearch}
                  className="transition-colors hover:text-primary"
                >
                  {lab.name}
                </Link>
              </h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{lab.tagline}</p>
            </div>
            <div className="text-right">
              <p className="text-[19px] font-bold tabular-nums leading-none">
                {formatINR(match.total)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {match.covered.length} test{match.covered.length === 1 ? "" : "s"}
                {match.collectionFee > 0 && ` + ${formatINR(match.collectionFee)} pickup`}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <RatingInline rating={lab.rating} count={lab.reviewCount} />
            <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
              <MapPin className="size-3.5" strokeWidth={1.75} />
              {lab.distanceKm} km · {lab.area}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[13px]",
                lab.homeCollection ? "text-muted-foreground" : "text-match-low",
              )}
            >
              <Home className="size-3.5" strokeWidth={1.75} />
              {lab.homeCollection ? "Home collection" : "Lab visit only"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[13px]",
                match.availableToday ? "text-match-excellent" : "text-muted-foreground",
              )}
            >
              <Clock className="size-3.5" strokeWidth={1.75} />
              {lab.earliestSlot}
            </span>
            <VerifiedBadge verified={lab.verified} />
          </div>

          {/* Coverage strip — one chip per requested test, missing ones marked. */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {testIds.map((id) => {
              const test = getTestById(id);
              const priced = match.covered.find((t) => t.testId === id);
              return (
                <span
                  key={id}
                  className={cn(
                    "rounded-sm border px-2 py-1 text-[12px]",
                    priced
                      ? "border-border text-foreground"
                      : "border-dashed border-match-low/50 text-match-low line-through",
                  )}
                >
                  {test?.name ?? id}
                  {priced && (
                    <span className="ml-1.5 tabular-nums text-muted-foreground">
                      {formatINR(priced.price)}
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          <details className="group mt-3.5">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[12px] font-semibold text-primary">
              Why this score
              <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" />
            </summary>
            <MatchBreakdown reasons={match.reasons} className="mt-3" />
          </details>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/book/$labId"
              params={{ labId: lab.id }}
              search={bookSearch}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book appointment
            </Link>
            <Link
              to="/labs/$labId"
              params={{ labId: lab.id }}
              search={bookSearch}
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-[13px] font-medium transition-colors hover:bg-secondary"
            >
              View lab
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
