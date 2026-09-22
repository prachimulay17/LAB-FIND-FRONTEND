/**
 * Match scoring.
 *
 * The score must always be explainable: every component returns both points
 * and a human-readable reason, so the UI never shows a bare number.
 * Weights are the product's definition of a "good" lab — tune them here.
 */

import type { Lab, LabTestPrice } from "@/data/labs";
import { formatINR } from "@/data/labs";
import { getTestById } from "@/data/tests";
import type { MatchReason } from "@/lib/match";

export type CollectionMode = "lab-visit" | "home-collection";

export interface SearchCriteria {
  testIds: string[];
  location: string;
  collection: CollectionMode;
  maxBudget: number | null;
}

export const MATCH_WEIGHTS = {
  coverage: 40,
  price: 20,
  distance: 15,
  collection: 10,
  rating: 8,
  availability: 4,
  verification: 3,
} as const;

export interface MatchedLab {
  lab: Lab;
  score: number;
  reasons: MatchReason[];
  covered: LabTestPrice[];
  missingTestIds: string[];
  subtotal: number;
  collectionFee: number;
  total: number;
  withinBudget: boolean;
  availableToday: boolean;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function matchLab(lab: Lab, criteria: SearchCriteria): MatchedLab {
  const covered = criteria.testIds
    .map((id) => lab.tests.find((t) => t.testId === id))
    .filter(Boolean) as LabTestPrice[];
  const missingTestIds = criteria.testIds.filter(
    (id) => !lab.tests.some((t) => t.testId === id),
  );

  const subtotal = covered.reduce((sum, t) => sum + t.price, 0);
  const wantsHome = criteria.collection === "home-collection";
  const homeAvailable = lab.homeCollection;
  const collectionFee =
    wantsHome && homeAvailable && subtotal < lab.homeCollectionMinOrder
      ? lab.homeCollectionFee
      : wantsHome && homeAvailable
        ? 0
        : 0;
  const total = subtotal + collectionFee;

  const coverageRatio = criteria.testIds.length
    ? covered.length / criteria.testIds.length
    : 1;

  const budget = criteria.maxBudget;
  const withinBudget = budget === null || total <= budget;
  const priceRatio = budget === null ? 0.8 : clamp(1 - Math.max(0, total - budget) / budget);

  const distanceRatio = clamp(1 - lab.distanceKm / 20);
  const ratingRatio = clamp((lab.rating - 3) / 2);
  const availableToday = lab.earliestSlot.toLowerCase().startsWith("today");

  const points =
    coverageRatio * MATCH_WEIGHTS.coverage +
    priceRatio * MATCH_WEIGHTS.price +
    distanceRatio * MATCH_WEIGHTS.distance +
    (wantsHome ? (homeAvailable ? 1 : 0) : 1) * MATCH_WEIGHTS.collection +
    ratingRatio * MATCH_WEIGHTS.rating +
    (availableToday ? 1 : 0.45) * MATCH_WEIGHTS.availability +
    (lab.verified ? 1 : 0) * MATCH_WEIGHTS.verification;

  const score = Math.round(clamp(points / 100) * 100);

  const missingNames = missingTestIds
    .map((id) => getTestById(id)?.name ?? id)
    .join(", ");

  const reasons: MatchReason[] = [
    {
      label:
        missingTestIds.length === 0
          ? `All ${criteria.testIds.length} requested test${criteria.testIds.length === 1 ? "" : "s"} available`
          : `${covered.length} of ${criteria.testIds.length} tests available — missing ${missingNames}`,
      met: missingTestIds.length === 0,
    },
    {
      label:
        budget === null
          ? `Total ${formatINR(total)} for the selected tests`
          : withinBudget
            ? `Total ${formatINR(total)} — within your ${formatINR(budget)} budget`
            : `Total ${formatINR(total)} — ${formatINR(total - budget)} over budget`,
      met: withinBudget,
    },
    {
      label: wantsHome
        ? homeAvailable
          ? collectionFee === 0
            ? "Home collection included at no extra charge"
            : `Home collection available (+${formatINR(collectionFee)})`
          : "No home collection — lab visit only"
        : `Walk-in collection at ${lab.area}`,
      met: wantsHome ? homeAvailable : true,
    },
    {
      label: `${lab.distanceKm} km away in ${lab.area}`,
      met: lab.distanceKm <= 8,
    },
    {
      label: `Rated ${lab.rating.toFixed(1)} across ${lab.reviewCount} reviews`,
      met: lab.rating >= 4.3,
    },
    {
      label: availableToday
        ? `Earliest slot ${lab.earliestSlot.toLowerCase()}`
        : `Earliest slot is ${lab.earliestSlot.toLowerCase()}`,
      met: availableToday,
    },
    {
      label: lab.verified
        ? `Verified — ${lab.accreditations[0] ?? "documents on file"}`
        : "Verification pending",
      met: lab.verified,
    },
  ];

  return {
    lab,
    score,
    reasons,
    covered,
    missingTestIds,
    subtotal,
    collectionFee,
    total,
    withinBudget,
    availableToday,
  };
}

export type SortKey = "match" | "price" | "distance" | "rating";

export const SORT_LABELS: Record<SortKey, string> = {
  match: "Best match",
  price: "Lowest price",
  distance: "Nearest",
  rating: "Highest rated",
};

export function sortMatches(matches: MatchedLab[], key: SortKey): MatchedLab[] {
  const list = [...matches];
  switch (key) {
    case "price":
      return list.sort((a, b) => a.total - b.total);
    case "distance":
      return list.sort((a, b) => a.lab.distanceKm - b.lab.distanceKm);
    case "rating":
      return list.sort((a, b) => b.lab.rating - a.lab.rating);
    default:
      return list.sort((a, b) => b.score - a.score);
  }
}
