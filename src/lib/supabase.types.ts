/**
 * Hand-written Supabase database types derived from the Prisma schema.
 *
 * These match the exact column names and types in the database (verified via
 * information_schema.columns). Update here whenever the Prisma schema changes.
 *
 * To auto-generate instead:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase.types.ts
 *
 * NOTE: every table requires a `Relationships` field (even if empty) so the
 * supabase-js generic types resolve the Update / Insert paths correctly.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      tests: {
        Row: {
          id: string;
          name: string;
          aliases: string[];
          category: string;
          sampleType: string;
          fastingRequired: boolean;
          preparation: string | null;
          reportTimeHours: number;
          createdAt: string;
          updatedAt: string;
        };
        Insert: never; // read-only from frontend
        Update: never;
        Relationships: [];
      };
      labs: {
        Row: {
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
          homeCollectionFee: number; // paise in DB — divide by 100 in fetch layer
          homeCollectionMinOrder: number; // paise in DB
          earliestSlot: string;
          openToday: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      lab_tests: {
        Row: {
          id: string;
          labId: string;
          testId: string;
          labName: string;
          price: number; // paise in DB
          reportTimeHours: number;
          createdAt: string;
          updatedAt: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      lab_hours: {
        Row: {
          id: string;
          labId: string;
          day: string;
          open: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          labId: string;
          author: string;
          rating: number;
          date: string;
          body: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string; // UUID matching auth.users.id
          full_name: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          phone?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ── Re-exported Supabase auth types ─────────────────────────────────────────
// Import from here instead of @supabase/supabase-js directly so there is one
// canonical location to update if the SDK version changes.
export type { Session, User } from "@supabase/supabase-js";
