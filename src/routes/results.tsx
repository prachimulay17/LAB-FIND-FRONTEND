import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, Map as MapIcon, List, Pencil, X } from "lucide-react";
import { AppShell } from "@/components/labfind/AppShell";
import { SearchPanel } from "@/components/labfind/SearchPanel";
import { LabCard } from "@/components/labfind/LabCard";
import { MapView } from "@/components/labfind/MapView";
import { MatchLegend } from "@/components/labfind/MatchScore";
import { formatINR } from "@/data/labs";
import { getTestById } from "@/data/tests";
import { matchLab, sortMatches, SORT_LABELS, type SortKey } from "@/lib/scoring";
import { toCriteria, validateResultsSearch, type ResultsSearch } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { useLabs } from "@/hooks/useLabs";

export const Route = createFileRoute("/results")({
  validateSearch: (raw: Record<string, unknown>): ResultsSearch =>
    validateResultsSearch(raw),
  head: () => ({
    meta: [
      { title: "Matched laboratories — LabFind" },
      {
        name: "description",
        content:
          "Compare matched diagnostic labs on test coverage, total price, distance, rating and home collection, with a synced map view.",
      },
      { property: "og:title", content: "Matched laboratories — LabFind" },
      {
        property: "og:description",
        content:
          "Every lab scored against your tests, budget, distance and collection preference.",
      },
    ],
  }),
  component: ResultsPage,
});

interface FilterState {
  minScore: number;
  homeOnly: boolean;
  verifiedOnly: boolean;
  todayOnly: boolean;
  fullCoverageOnly: boolean;
  withinBudgetOnly: boolean;
  maxDistance: number;
}

const DEFAULT_FILTERS: FilterState = {
  minScore: 0,
  homeOnly: false,
  verifiedOnly: false,
  todayOnly: false,
  fullCoverageOnly: false,
  withinBudgetOnly: false,
  maxDistance: 20,
};

function ResultsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const criteria = useMemo(() => toCriteria(search), [search]);

  const { data: labs = [], isLoading: labsLoading, isError: labsError } = useLabs();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("match");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allMatches = useMemo(
    () => labs.map((lab) => matchLab(lab, criteria)),
    [labs, criteria],
  );

  const filtered = useMemo(() => {
    const list = allMatches.filter((m) => {
      if (m.score < filters.minScore) return false;
      if (filters.homeOnly && !m.lab.homeCollection) return false;
      if (filters.verifiedOnly && !m.lab.verified) return false;
      if (filters.todayOnly && !m.availableToday) return false;
      if (filters.fullCoverageOnly && m.missingTestIds.length > 0) return false;
      if (filters.withinBudgetOnly && !m.withinBudget) return false;
      if (m.lab.distanceKm > filters.maxDistance) return false;
      return true;
    });
    return sortMatches(list, sort);
  }, [allMatches, filters, sort]);

  const cheapest = filtered.length
    ? Math.min(...filtered.map((m) => m.total))
    : 0;

  const activeFilterCount =
    (filters.minScore > 0 ? 1 : 0) +
    (filters.homeOnly ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.todayOnly ? 1 : 0) +
    (filters.fullCoverageOnly ? 1 : 0) +
    (filters.withinBudgetOnly ? 1 : 0) +
    (filters.maxDistance < 20 ? 1 : 0);

  const toggles: { key: keyof FilterState; label: string }[] = [
    { key: "fullCoverageOnly", label: "All tests available" },
    { key: "withinBudgetOnly", label: "Within budget" },
    { key: "homeOnly", label: "Home collection" },
    { key: "verifiedOnly", label: "Verified labs" },
    { key: "todayOnly", label: "Slot available today" },
  ];

  return (
    <AppShell>
      {/* Data-source status banner — shown only when Supabase fetch fails.
          The page still works via placeholderData from the static mock. */}
      {labsLoading && (
        <div className="border-b border-border bg-secondary/60 px-5 py-2 text-center text-[12px] text-muted-foreground">
          Loading live lab data…
        </div>
      )}
      {labsError && (
        <div className="border-b border-destructive/30 bg-destructive/8 px-5 py-2 text-center text-[12px] text-destructive">
          Could not reach the lab database — showing cached data.
        </div>
      )}
      {/* Criteria bar — always shows what the score is being computed against. */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1320px] px-5 py-3 lg:px-10">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">
                {criteria.testIds.length} test{criteria.testIds.length === 1 ? "" : "s"} ·{" "}
                {criteria.location}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                {criteria.testIds
                  .map((id) => getTestById(id)?.name ?? id)
                  .join(", ")}{" "}
                ·{" "}
                {criteria.collection === "home-collection" ? "Home collection" : "Lab visit"}
                {criteria.maxBudget ? ` · Budget ${formatINR(criteria.maxBudget)}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-surface px-3 text-[13px] font-medium transition-colors hover:bg-secondary"
            >
              {editing ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
              {editing ? "Close" : "Edit search"}
            </button>
          </div>
          {editing && (
            <div className="pb-4 pt-3">
              <SearchPanel
                initial={criteria}
                submitLabel="Update results"
                onSubmitted={() => setEditing(false)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-5 py-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">
              {filtered.length} laboratories matched
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Lowest total {formatINR(cheapest)} · scored on coverage, price, distance,
              collection, rating, availability and verification.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="hidden text-[12px] text-muted-foreground sm:block" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-md border border-border bg-surface px-2.5 text-[13px] font-medium"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-[13px] font-medium lg:hidden"
            >
              <SlidersHorizontal className="size-3.5" />
              Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[212px_minmax(0,1fr)] xl:grid-cols-[212px_minmax(0,1fr)_min(44%,560px)]">
          {/* Filter rail */}
          <aside
            className={cn(
              "border border-border bg-surface p-4 lg:sticky lg:top-[7.75rem] lg:self-start lg:border-x-0 lg:border-b-0 lg:border-t-0 lg:bg-transparent lg:p-0",
              filtersOpen ? "block" : "hidden lg:block",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="label-caps">Refine</p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-[12px] font-medium text-primary hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              {toggles.map((t) => (
                <label
                  key={t.key}
                  className="flex cursor-pointer items-center gap-2.5 text-[13px]"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(filters[t.key])}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, [t.key]: e.target.checked }))
                    }
                    className="size-4 accent-[var(--primary)]"
                  />
                  {t.label}
                </label>
              ))}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <label htmlFor="minScore" className="label-caps">
                Minimum match
              </label>
              <input
                id="minScore"
                type="range"
                min={0}
                max={95}
                step={5}
                value={filters.minScore}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minScore: Number(e.target.value) }))
                }
                className="mt-2.5 w-full accent-[var(--primary)]"
              />
              <p className="mt-1 text-[12px] tabular-nums text-muted-foreground">
                {filters.minScore}% and above
              </p>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <label htmlFor="maxDistance" className="label-caps">
                Maximum distance
              </label>
              <input
                id="maxDistance"
                type="range"
                min={2}
                max={20}
                step={1}
                value={filters.maxDistance}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxDistance: Number(e.target.value) }))
                }
                className="mt-2.5 w-full accent-[var(--primary)]"
              />
              <p className="mt-1 text-[12px] tabular-nums text-muted-foreground">
                Within {filters.maxDistance} km
              </p>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="label-caps">Score legend</p>
              <MatchLegend className="mt-3 flex-col items-start gap-2" />
            </div>
          </aside>

          {/* Mobile list/map switch */}
          <div className="flex overflow-hidden rounded-md border border-border xl:hidden">
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 py-2 text-[13px] font-medium",
                mobileView === "list" ? "bg-primary-soft text-primary" : "bg-surface",
              )}
            >
              <List className="size-4" /> Results
            </button>
            <button
              type="button"
              onClick={() => setMobileView("map")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-l border-border py-2 text-[13px] font-medium",
                mobileView === "map" ? "bg-primary-soft text-primary" : "bg-surface",
              )}
            >
              <MapIcon className="size-4" /> Map
            </button>
          </div>

          <div
            className={cn(
              "min-w-0 border border-border bg-surface",
              mobileView === "map" && "hidden xl:block",
            )}
          >
            {filtered.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-[15px] font-semibold">No labs match these filters</p>
                <p className="mx-auto mt-2 max-w-[44ch] text-[13px] text-muted-foreground">
                  Relax a filter or widen the distance. Partial-coverage labs are still
                  scored, so you can split tests across two labs if needed.
                </p>
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-4 rounded-md border border-border px-4 py-2 text-[13px] font-medium hover:bg-secondary"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filtered.map((match) => (
                <LabCard
                  key={match.lab.id}
                  match={match}
                  testIds={criteria.testIds}
                  active={activeId === match.lab.id}
                  onHover={setActiveId}
                  onSelect={setActiveId}
                  bookSearch={search}
                />
              ))
            )}
          </div>

          <div
            className={cn(
              "xl:sticky xl:top-[7.75rem] xl:self-start",
              mobileView === "list" && "hidden xl:block",
            )}
          >
            <MapView
              matches={filtered}
              activeId={activeId}
              onActivate={setActiveId}
              bookSearch={search}
              className="h-[420px] xl:h-[calc(100vh-10rem)]"
            />
            <p className="mt-2 text-[12px] text-muted-foreground">
              Schematic view projected from lab coordinates. Hover a result to locate it.
            </p>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-5 text-[13px] text-muted-foreground">
          Looking for something else?{" "}
          <Link
            to="/"
            className="font-medium text-primary hover:underline"
            onClick={() => navigate({ to: "/" })}
          >
            Start a new search
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}
