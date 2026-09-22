import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { TestSelector } from "./TestSelector";
import { LocationSelector } from "./LocationSelector";
import { CollectionSelector } from "./CollectionSelector";
import { BudgetInput } from "./BudgetInput";
import { getTestById, type CanonicalTest } from "@/data/tests";
import type { CollectionMode, SearchCriteria } from "@/lib/scoring";
import { fromCriteria } from "@/lib/search-params";

const DEFAULT_TESTS = ["cbc", "vitamin-d", "hba1c", "thyroid-profile"]
  .map(getTestById)
  .filter(Boolean) as CanonicalTest[];

interface SearchPanelProps {
  initial?: SearchCriteria;
  submitLabel?: string;
  onSubmitted?: (criteria: SearchCriteria) => void;
}

export function SearchPanel({
  initial,
  submitLabel = "Find my best match",
  onSubmitted,
}: SearchPanelProps) {
  const navigate = useNavigate();
  const [tests, setTests] = useState<CanonicalTest[]>(
    initial
      ? (initial.testIds.map(getTestById).filter(Boolean) as CanonicalTest[])
      : DEFAULT_TESTS,
  );
  const [location, setLocation] = useState(initial?.location ?? "Pune, Maharashtra");
  const [collection, setCollection] = useState<CollectionMode>(
    initial?.collection ?? "home-collection",
  );
  const [budget, setBudget] = useState(
    initial?.maxBudget != null ? String(initial.maxBudget) : "1500",
  );
  const [pending, setPending] = useState(false);

  const canSearch = tests.length > 0 && location.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSearch) return;
    const criteria: SearchCriteria = {
      testIds: tests.map((t) => t.id),
      location: location.trim(),
      collection,
      maxBudget: budget ? Number(budget) : null,
    };
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      onSubmitted?.(criteria);
      void navigate({ to: "/results", search: fromCriteria(criteria) });
    }, 400);
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-panel)] sm:p-6"
      aria-label="Find a diagnostic lab"
    >
      <TestSelector selected={tests} onChange={setTests} />

      <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <LocationSelector value={location} onChange={setLocation} />
        <CollectionSelector value={collection} onChange={setCollection} />
      </div>

      <div className="mt-4 grid items-end gap-4 sm:grid-cols-2">
        <BudgetInput value={budget} onChange={setBudget} />
        <button
          type="submit"
          disabled={!canSearch || pending}
          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md bg-primary px-5 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              Finding labs
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowRight className="size-4" strokeWidth={2} />
            </>
          )}
        </button>
      </div>

      {tests.length === 0 && (
        <p className="mt-3 text-[12px] text-muted-foreground">
          Add at least one test to compare laboratories.
        </p>
      )}
    </form>
  );
}
