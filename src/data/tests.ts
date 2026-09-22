/**
 * Canonical test catalog.
 *
 * Labs use different names for the same investigation (CBC / Complete Blood
 * Count / Hemogram). The UI always works with the canonical test; `aliases`
 * exist purely so search can resolve lab-specific naming later.
 *
 * This module is mock data shaped like the eventual API response
 * (GET /tests). Replace the array, keep the types.
 */

export type SampleType = "Blood" | "Urine" | "Swab" | "Stool";

export interface CanonicalTest {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  sampleType: SampleType;
  fastingRequired: boolean;
  preparation?: string;
  reportTimeHours: number;
}

export const TEST_CATALOG: CanonicalTest[] = [
  {
    id: "cbc",
    name: "CBC",
    aliases: ["Complete Blood Count", "Hemogram", "Full Blood Count"],
    category: "Haematology",
    sampleType: "Blood",
    fastingRequired: false,
    reportTimeHours: 12,
  },
  {
    id: "hba1c",
    name: "HbA1c",
    aliases: ["Glycated Haemoglobin", "Glycosylated Hb", "A1c"],
    category: "Diabetes",
    sampleType: "Blood",
    fastingRequired: false,
    reportTimeHours: 24,
  },
  {
    id: "vitamin-d",
    name: "Vitamin D",
    aliases: ["25-OH Vitamin D", "Vitamin D3", "Cholecalciferol"],
    category: "Vitamins",
    sampleType: "Blood",
    fastingRequired: false,
    reportTimeHours: 24,
  },
  {
    id: "thyroid-profile",
    name: "Thyroid Profile",
    aliases: ["TSH, T3, T4", "Thyroid Function Test", "TFT"],
    category: "Hormones",
    sampleType: "Blood",
    fastingRequired: false,
    reportTimeHours: 24,
  },
  {
    id: "lipid-profile",
    name: "Lipid Profile",
    aliases: ["Cholesterol Panel", "Lipid Panel"],
    category: "Cardiac",
    sampleType: "Blood",
    fastingRequired: true,
    preparation: "10–12 hours fasting",
    reportTimeHours: 12,
  },
  {
    id: "lft",
    name: "Liver Function Test",
    aliases: ["LFT", "Hepatic Panel"],
    category: "Organ Panel",
    sampleType: "Blood",
    fastingRequired: true,
    preparation: "8 hours fasting",
    reportTimeHours: 24,
  },
  {
    id: "kft",
    name: "Kidney Function Test",
    aliases: ["KFT", "Renal Panel", "RFT"],
    category: "Organ Panel",
    sampleType: "Blood",
    fastingRequired: false,
    reportTimeHours: 24,
  },
  {
    id: "vitamin-b12",
    name: "Vitamin B12",
    aliases: ["Cobalamin", "Serum B12"],
    category: "Vitamins",
    sampleType: "Blood",
    fastingRequired: false,
    reportTimeHours: 24,
  },
  {
    id: "urine-routine",
    name: "Urine Routine",
    aliases: ["Urine R/M", "Urinalysis"],
    category: "Pathology",
    sampleType: "Urine",
    fastingRequired: false,
    reportTimeHours: 6,
  },
  {
    id: "iron-studies",
    name: "Iron Studies",
    aliases: ["Serum Iron, TIBC, Ferritin", "Iron Panel"],
    category: "Haematology",
    sampleType: "Blood",
    fastingRequired: true,
    preparation: "Morning sample preferred",
    reportTimeHours: 24,
  },
];

export function searchTests(query: string, excludeIds: string[] = []): CanonicalTest[] {
  const q = query.trim().toLowerCase();
  return TEST_CATALOG.filter((test) => {
    if (excludeIds.includes(test.id)) return false;
    if (!q) return true;
    return (
      test.name.toLowerCase().includes(q) ||
      test.category.toLowerCase().includes(q) ||
      test.aliases.some((alias) => alias.toLowerCase().includes(q))
    );
  });
}

export function getTestById(id: string): CanonicalTest | undefined {
  return TEST_CATALOG.find((test) => test.id === id);
}
