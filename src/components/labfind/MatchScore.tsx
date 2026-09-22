import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMatchTier, MATCH_TIER_LABEL, type MatchReason, type MatchTier } from "@/lib/match";

const TIER_STYLES: Record<MatchTier, { box: string; text: string; dot: string }> = {
  excellent: {
    box: "border-match-excellent/40 bg-match-excellent/8",
    text: "text-match-excellent",
    dot: "bg-match-excellent",
  },
  good: {
    box: "border-match-good/40 bg-match-good/8",
    text: "text-match-good",
    dot: "bg-match-good",
  },
  partial: {
    box: "border-match-partial/45 bg-match-partial/10",
    text: "text-match-partial",
    dot: "bg-match-partial",
  },
  low: {
    box: "border-match-low/40 bg-match-low/8",
    text: "text-match-low",
    dot: "bg-match-low",
  },
};

export function matchTierStyles(tier: MatchTier) {
  return TIER_STYLES[tier];
}

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md";
  className?: string;
}

/** Compact score block used in result rows and map markers. */
export function MatchScore({ score, size = "md", className }: MatchScoreProps) {
  const tier = getMatchTier(score);
  const styles = TIER_STYLES[tier];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border transition-colors",
        styles.box,
        size === "md" ? "h-[68px] w-[68px]" : "h-12 w-12",
        className,
      )}
      aria-label={`${score} percent — ${MATCH_TIER_LABEL[tier]}`}
    >
      <span
        className={cn("font-bold tabular-nums", styles.text, size === "md" ? "text-[22px]" : "text-[15px]")}
      >
        {score}
        <span className="text-[0.6em] font-semibold">%</span>
      </span>
      <span className="label-caps text-[9px] leading-none">Match</span>
    </div>
  );
}

/** Explains the score: the number alone is not a product feature. */
export function MatchBreakdown({ reasons, className }: { reasons: MatchReason[]; className?: string }) {
  return (
    <ul className={cn("grid gap-1.5 sm:grid-cols-2", className)}>
      {reasons.map((reason) => (
        <li
          key={reason.label}
          className={cn(
            "flex items-start gap-2 text-[13px]",
            reason.met ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {reason.met ? (
            <Check className="mt-0.5 size-3.5 shrink-0 text-match-excellent" strokeWidth={2} />
          ) : (
            <Minus className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
          )}
          {reason.label}
        </li>
      ))}
    </ul>
  );
}

export function MatchLegend({ className }: { className?: string }) {
  const tiers: MatchTier[] = ["excellent", "good", "partial", "low"];
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      {tiers.map((tier) => (
        <span key={tier} className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span className={cn("size-2 rounded-full", TIER_STYLES[tier].dot)} />
          {MATCH_TIER_LABEL[tier]}
        </span>
      ))}
    </div>
  );
}
