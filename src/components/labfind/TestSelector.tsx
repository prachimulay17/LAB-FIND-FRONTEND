import { useEffect, useRef, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { searchTests, type CanonicalTest } from "@/data/tests";

interface TestSelectorProps {
  selected: CanonicalTest[];
  onChange: (tests: CanonicalTest[]) => void;
}

/** Multi-test selector working against canonical tests (aliases are searchable). */
export function TestSelector({ selected, onChange }: TestSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = searchTests(
    query,
    selected.map((t) => t.id),
  );

  const add = (test: CanonicalTest) => {
    onChange([...selected, test]);
    setQuery("");
  };

  return (
    <div ref={wrapRef} className="relative">
      <span className="label-caps">I need</span>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {selected.map((test) => (
          <span
            key={test.id}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary py-1 pr-1 pl-2.5 text-[13px] font-medium"
          >
            {test.name}
            <button
              type="button"
              onClick={() => onChange(selected.filter((t) => t.id !== test.id))}
              aria-label={`Remove ${test.name}`}
              className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
            >
              <X className="size-3" strokeWidth={2} />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border-strong px-2.5 py-1 text-[13px] font-medium text-primary transition-colors hover:bg-primary-soft"
        >
          <Plus className="size-3.5" strokeWidth={2} />
          Add test
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 z-30 mt-2 w-full max-w-[420px] overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-raised)]">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 text-muted-foreground" strokeWidth={1.75} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tests, e.g. Hemogram"
              className="w-full bg-transparent py-2.5 text-[14px] outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                No test matches “{query}”.
              </li>
            )}
            {results.map((test) => (
              <li key={test.id}>
                <button
                  type="button"
                  onClick={() => add(test)}
                  className="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-secondary"
                >
                  <span>
                    <span className="text-[14px] font-medium">{test.name}</span>
                    <span className="ml-2 text-[12px] text-muted-foreground">
                      {test.aliases[0]}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{test.category}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
