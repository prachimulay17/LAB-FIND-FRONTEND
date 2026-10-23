/**
 * Test catalog fetch functions — backed by Supabase.
 *
 * The returned shape matches the existing `CanonicalTest` interface from
 * src/data/tests.ts exactly, so scoring.ts and all components are unchanged.
 */

import { supabase } from "@/lib/supabase";
import type { CanonicalTest, SampleType } from "@/data/tests";

type TestRow = {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  sampleType: string;
  fastingRequired: boolean;
  preparation: string | null;
  reportTimeHours: number;
};

function toCanonicalTest(row: TestRow): CanonicalTest {
  return {
    id: row.id,
    name: row.name,
    aliases: row.aliases,
    category: row.category,
    sampleType: row.sampleType as SampleType,
    fastingRequired: row.fastingRequired,
    // undefined vs null: CanonicalTest.preparation is optional (undefined),
    // the DB stores null. Normalise here so downstream code stays clean.
    ...(row.preparation !== null ? { preparation: row.preparation } : {}),
    reportTimeHours: row.reportTimeHours,
  };
}

/** Fetch the full test catalog. */
export async function fetchTests(): Promise<CanonicalTest[]> {
  const { data, error } = await supabase
    .from("tests")
    .select("id,name,aliases,category,sampleType,fastingRequired,preparation,reportTimeHours")
    .order("name");

  if (error) throw new Error(`fetchTests: ${error.message}`);

  return ((data ?? []) as TestRow[]).map(toCanonicalTest);
}
