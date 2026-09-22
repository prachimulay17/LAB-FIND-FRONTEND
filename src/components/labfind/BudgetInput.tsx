interface BudgetInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function BudgetInput({ value, onChange }: BudgetInputProps) {
  return (
    <div>
      <label htmlFor="budget" className="label-caps">
        Budget <span className="font-medium normal-case">(optional)</span>
      </label>
      <div className="mt-2 flex items-center gap-1 rounded-md border border-border bg-surface px-3 focus-within:border-primary">
        <span className="text-[14px] text-muted-foreground">₹</span>
        <input
          id="budget"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="1500"
          className="w-full bg-transparent py-2.5 text-[14px] tabular-nums outline-none placeholder:text-muted-foreground"
        />
        <span className="shrink-0 text-[12px] text-muted-foreground">max total</span>
      </div>
    </div>
  );
}
