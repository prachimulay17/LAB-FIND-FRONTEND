/**
 * Lab fetch functions — backed by Supabase.
 *
 * Paise → rupees conversion happens here so the rest of the app (including
 * scoring.ts) continues to work with rupee values, exactly as the mock data did.
 *
 * The returned shape matches the existing `Lab` and `LabTestPrice` interfaces
 * from src/data/labs.ts so all downstream code (scoring, components) is
 * unchanged.
 */

import { supabase } from "@/lib/supabase";
import type { Lab, LabReview, LabTestPrice } from "@/data/labs";

// ─── internal DB row types ────────────────────────────────────────────────────

type LabRow = {
  id: string;
  name: string;
  tagline: string;
  area: string;
  city: string;
  addressLine: string;
  lat: number;
  lng: number;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  accreditations: string[];
  facilities: string[];
  homeCollection: boolean;
  homeCollectionFee: number; // paise
  homeCollectionMinOrder: number; // paise
  earliestSlot: string;
  openToday: string;
};

type LabTestRow = {
  testId: string;
  labName: string;
  price: number; // paise
  reportTimeHours: number;
};

type LabHoursRow = {
  day: string;
  open: string;
};

type ReviewRow = {
  id: string;
  author: string;
  rating: number;
  date: string;
  body: string;
};

// ─── converters ───────────────────────────────────────────────────────────────

/** Convert a DB lab row + its related rows into the frontend Lab shape. */
function toLabWithRelations(
  row: LabRow,
  tests: LabTestRow[],
  hours: LabHoursRow[],
  reviews: ReviewRow[],
): Lab {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    area: row.area,
    city: row.city,
    addressLine: row.addressLine,
    lat: row.lat,
    lng: row.lng,
    distanceKm: row.distanceKm,
    rating: row.rating,
    reviewCount: row.reviewCount,
    verified: row.verified,
    accreditations: row.accreditations,
    facilities: row.facilities,
    homeCollection: row.homeCollection,
    // paise → rupees
    homeCollectionFee: row.homeCollectionFee / 100,
    homeCollectionMinOrder: row.homeCollectionMinOrder / 100,
    earliestSlot: row.earliestSlot,
    openToday: row.openToday,
    hours,
    tests: tests.map(
      (t): LabTestPrice => ({
        testId: t.testId,
        labName: t.labName,
        price: t.price / 100, // paise → rupees
        reportTimeHours: t.reportTimeHours,
      }),
    ),
    reviews: reviews.map(
      (r): LabReview => ({
        id: r.id,
        author: r.author,
        rating: r.rating,
        date: r.date,
        body: r.body,
      }),
    ),
  };
}

/** Convert a plain lab row into a Lab with empty relations (for list view). */
function toLabShallow(row: LabRow): Lab {
  return toLabWithRelations(row, [], [], []);
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all labs without relation data.
 * Used by the results page — relations are not needed for scoring or the card.
 * Scoring only uses top-level Lab fields + tests[], so a second fetch for
 * lab_tests is performed here and merged in.
 */
export async function fetchLabs(): Promise<Lab[]> {
  const [labsResult, testsResult] = await Promise.all([
    supabase.from("labs").select(
      "id,name,tagline,area,city,addressLine,lat,lng,distanceKm,rating,reviewCount," +
        "verified,accreditations,facilities,homeCollection,homeCollectionFee," +
        "homeCollectionMinOrder,earliestSlot,openToday",
    ),
    supabase.from("lab_tests").select("labId,testId,labName,price,reportTimeHours"),
  ]);

  if (labsResult.error) {
    throw new Error(`fetchLabs: ${labsResult.error.message}`);
  }
  if (testsResult.error) {
    throw new Error(`fetchLabs (lab_tests): ${testsResult.error.message}`);
  }

  const labRows = (labsResult.data ?? []) as unknown as LabRow[];
  const testRows = (testsResult.data ?? []) as (LabTestRow & { labId: string })[];

  // Group lab_tests by labId
  const testsByLab = new Map<string, (LabTestRow & { labId: string })[]>();
  for (const t of testRows) {
    const existing = testsByLab.get(t.labId);
    if (existing) {
      existing.push(t);
    } else {
      testsByLab.set(t.labId, [t]);
    }
  }

  return labRows.map((row) =>
    toLabWithRelations(row, testsByLab.get(row.id) ?? [], [], []),
  );
}

/**
 * Fetch a single lab with all relations: tests, hours, reviews.
 * Used by the lab detail page.
 */
export async function fetchLabById(id: string): Promise<Lab | null> {
  const [labResult, testsResult, hoursResult, reviewsResult] = await Promise.all([
    supabase
      .from("labs")
      .select(
        "id,name,tagline,area,city,addressLine,lat,lng,distanceKm,rating,reviewCount," +
          "verified,accreditations,facilities,homeCollection,homeCollectionFee," +
          "homeCollectionMinOrder,earliestSlot,openToday",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("lab_tests")
      .select("testId,labName,price,reportTimeHours")
      .eq("labId", id),
    supabase
      .from("lab_hours")
      .select("day,open")
      .eq("labId", id),
    supabase
      .from("reviews")
      .select("id,author,rating,date,body")
      .eq("labId", id),
  ]);

  // PGRST116 = "Row not found" — not an error, just null
  if (labResult.error) {
    if (labResult.error.code === "PGRST116") return null;
    throw new Error(`fetchLabById(${id}): ${labResult.error.message}`);
  }
  if (testsResult.error) throw new Error(`fetchLabById tests: ${testsResult.error.message}`);
  if (hoursResult.error) throw new Error(`fetchLabById hours: ${hoursResult.error.message}`);
  if (reviewsResult.error) throw new Error(`fetchLabById reviews: ${reviewsResult.error.message}`);

  return toLabWithRelations(
    labResult.data as unknown as LabRow,
    (testsResult.data ?? []) as LabTestRow[],
    (hoursResult.data ?? []) as LabHoursRow[],
    (reviewsResult.data ?? []) as ReviewRow[],
  );
}
