import { Building2, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type CollectionMode = "lab-visit" | "home-collection";

const OPTIONS = [
  { id: "lab-visit" as const, label: "Lab Visit", icon: Building2 },
  { id: "home-collection" as const, label: "Home Collection", icon: Home },
];

interface CollectionSelectorProps {
  value: CollectionMode;
  onChange: (value: CollectionMode) => void;
}

export function CollectionSelector({ value, onChange }: CollectionSelectorProps) {
  return (
    <fieldset>
      <legend className="label-caps">Collection</legend>
      <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-md border border-border">
        {OPTIONS.map((option, i) => {
          const active = value === option.id;
          const Icon = option.icon;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-3 py-2.5 text-[14px] transition-colors",
                i === 1 && "border-l border-border",
                active
                  ? "bg-primary-soft font-semibold text-primary"
                  : "bg-surface font-medium text-muted-foreground hover:bg-secondary",
              )}
            >
              <input
                type="radio"
                name="collection"
                value={option.id}
                checked={active}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              <Icon className="size-4" strokeWidth={1.75} />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
