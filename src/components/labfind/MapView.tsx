import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Locate } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResultsSearch } from "@/lib/search-params";
import { formatINR } from "@/data/labs";
import { getMatchTier } from "@/lib/match";
import type { MatchedLab } from "@/lib/scoring";

/**
 * Schematic map surface.
 *
 * Coordinates are projected from real lat/lng, so swapping this component for
 * Mapbox/Leaflet later is a rendering change only — the data contract holds.
 */

const USER = { lat: 18.5595, lng: 73.7995 };

const TIER_MARKER = {
  excellent: "bg-match-excellent text-primary-foreground",
  good: "bg-match-good text-primary-foreground",
  partial: "bg-match-partial text-foreground",
  low: "bg-match-low text-primary-foreground",
} as const;

interface MapViewProps {
  matches: MatchedLab[];
  activeId: string | null;
  onActivate: (id: string | null) => void;
  bookSearch: ResultsSearch;
  className?: string;
}

export function MapView({
  matches,
  activeId,
  onActivate,
  bookSearch,
  className,
}: MapViewProps) {
  const points = useMemo(() => {
    const lats = [USER.lat, ...matches.map((m) => m.lab.lat)];
    const lngs = [USER.lng, ...matches.map((m) => m.lab.lng)];
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padLat = (maxLat - minLat) * 0.18 || 0.01;
    const padLng = (maxLng - minLng) * 0.18 || 0.01;

    const project = (lat: number, lng: number) => ({
      x: ((lng - (minLng - padLng)) / (maxLng - minLng + padLng * 2)) * 100,
      y: (1 - (lat - (minLat - padLat)) / (maxLat - minLat + padLat * 2)) * 100,
    });

    return {
      user: project(USER.lat, USER.lng),
      labs: matches.map((m) => ({ match: m, ...project(m.lab.lat, m.lab.lng) })),
    };
  }, [matches]);

  const active = matches.find((m) => m.lab.id === activeId);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-secondary",
        className,
      )}
    >
      {/* Grid + arterial lines stand in for tiles without pretending to be decoration. */}
      <svg
        className="absolute inset-0 size-full text-border"
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {Array.from({ length: 11 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * 10}
            y1={0}
            x2={i * 10}
            y2={100}
            stroke="currentColor"
            strokeWidth={0.15}
          />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * 10}
            x2={100}
            y2={i * 10}
            stroke="currentColor"
            strokeWidth={0.15}
          />
        ))}
        <path
          d="M -5 62 C 20 55, 38 74, 62 60 S 92 44, 108 52"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.1}
        />
        <path
          d="M 30 -5 C 36 25, 24 52, 42 78 S 58 100, 60 108"
          fill="none"
          stroke="currentColor"
          strokeWidth={0.9}
        />
        <path
          d="M 72 -5 C 68 22, 84 46, 74 70 S 70 96, 78 108"
          fill="none"
          stroke="currentColor"
          strokeWidth={0.7}
        />
      </svg>

      {/* Search-origin marker */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${points.user.x}%`, top: `${points.user.y}%` }}
      >
        <span className="flex size-4 items-center justify-center rounded-full border-2 border-surface bg-primary shadow-[var(--shadow-raised)]" />
        <span className="mt-1 block -translate-x-1/2 whitespace-nowrap rounded-sm border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold">
          You
        </span>
      </div>

      {points.labs.map(({ match, x, y }) => {
        const tier = getMatchTier(match.score);
        const isActive = match.lab.id === activeId;
        return (
          <button
            key={match.lab.id}
            type="button"
            onMouseEnter={() => onActivate(match.lab.id)}
            onClick={() => onActivate(match.lab.id)}
            aria-label={`${match.lab.name}, ${match.score} percent match`}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface text-[11px] font-bold tabular-nums transition-all",
              TIER_MARKER[tier],
              isActive
                ? "z-20 size-11 shadow-[var(--shadow-raised)] ring-2 ring-foreground/70"
                : "z-10 size-9 hover:size-10",
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {match.score}
          </button>
        );
      })}

      {/* Active lab preview, anchored like a real map info card */}
      {active && (
        <div className="absolute inset-x-3 bottom-3 z-30 rounded-md border border-border bg-surface p-3 shadow-[var(--shadow-raised)] sm:inset-x-auto sm:left-3 sm:w-[290px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{active.lab.name}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {active.lab.distanceKm} km · {active.lab.area} · {active.lab.rating.toFixed(1)} ★
              </p>
            </div>
            <p className="shrink-0 text-[14px] font-bold tabular-nums">
              {formatINR(active.total)}
            </p>
          </div>
          <div className="mt-2.5 flex gap-2">
            <Link
              to="/labs/$labId"
              params={{ labId: active.lab.id }}
              search={bookSearch}
              className="flex-1 rounded-md border border-border px-3 py-1.5 text-center text-[12px] font-medium transition-colors hover:bg-secondary"
            >
              View lab
            </Link>
            <Link
              to="/book/$labId"
              params={{ labId: active.lab.id }}
              search={bookSearch}
              className="flex-1 rounded-md bg-primary px-3 py-1.5 text-center text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book
            </Link>
          </div>
        </div>
      )}

      <div className="absolute right-3 top-3 z-30 flex items-center gap-2 rounded-md border border-border bg-surface/95 px-2.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur-sm">
        <Locate className="size-3.5" strokeWidth={1.75} />
        Marker value = match score
      </div>
    </div>
  );
}
