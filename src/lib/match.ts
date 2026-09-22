/**
 * Match-score model.
 *
 * Thresholds live here on purpose — tuning the product's definition of a
 * "good" lab should be a one-line change, not a UI refactor.
 */

export type MatchTier = "excellent" | "good" | "partial" | "low";

export const MATCH_THRESHOLDS: Record<Exclude<MatchTier, "low">, number> = {
  excellent: 90,
  good: 75,
  partial: 50,
};

export const MATCH_TIER_LABEL: Record<MatchTier, string> = {
  excellent: "Excellent match",
  good: "Good match",
  partial: "Partial match",
  low: "Low match",
};

export function getMatchTier(score: number): MatchTier {
  if (score >= MATCH_THRESHOLDS.excellent) return "excellent";
  if (score >= MATCH_THRESHOLDS.good) return "good";
  if (score >= MATCH_THRESHOLDS.partial) return "partial";
  return "low";
}

/** Reason a lab gained or lost points, shown so the score is never opaque. */
export interface MatchReason {
  label: string;
  met: boolean;
}
