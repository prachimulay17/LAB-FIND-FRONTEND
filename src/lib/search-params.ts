/**
 * Search criteria <-> URL search params.
 *
 * Criteria live in the URL so results are shareable and survive reloads;
 * no client store is needed until real APIs arrive.
 */

import type { CollectionMode, SearchCriteria } from "@/lib/scoring";

export interface ResultsSearch {
  tests: string;
  loc: string;
  mode: CollectionMode;
  budget: number | null;
}

export const DEFAULT_SEARCH: ResultsSearch = {
  tests: "cbc,vitamin-d,hba1c,thyroid-profile",
  loc: "Pune, Maharashtra",
  mode: "home-collection",
  budget: 1500,
};

export function validateResultsSearch(raw: Record<string, unknown>): ResultsSearch {
  const rawTests = raw["tests"];
  const rawLoc = raw["loc"];
  const tests = typeof rawTests === "string" && rawTests ? rawTests : DEFAULT_SEARCH.tests;
  const loc = typeof rawLoc === "string" && rawLoc ? rawLoc : DEFAULT_SEARCH.loc;
  const mode: CollectionMode = raw["mode"] === "lab-visit" ? "lab-visit" : "home-collection";
  const budgetRaw = Number(raw["budget"]);
  const budget = Number.isFinite(budgetRaw) && budgetRaw > 0 ? budgetRaw : null;
  return { tests, loc, mode, budget };
}

export function toCriteria(search: ResultsSearch): SearchCriteria {
  return {
    testIds: search.tests.split(",").filter(Boolean),
    location: search.loc,
    collection: search.mode,
    maxBudget: search.budget,
  };
}

export function fromCriteria(criteria: SearchCriteria): ResultsSearch {
  return {
    tests: criteria.testIds.join(","),
    loc: criteria.location,
    mode: criteria.collection,
    budget: criteria.maxBudget,
  };
}
