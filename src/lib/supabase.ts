/**
 * Supabase client singleton.
 *
 * Uses only the public anon key — reads are gated by RLS policies that allow
 * SELECT for all on the five read-only tables. The service_role key is never
 * imported here.
 *
 * Environment variables must be set in .env.local (gitignored):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

if (!supabaseUrl || supabaseUrl === "https://your-project-ref.supabase.co") {
  throw new Error(
    "VITE_SUPABASE_URL is not configured.\n" +
      "Copy .env.example to .env.local and fill in your Supabase project URL.",
  );
}
if (!supabaseAnonKey || supabaseAnonKey === "your-anon-key-here") {
  throw new Error(
    "VITE_SUPABASE_ANON_KEY is not configured.\n" +
      "Copy .env.example to .env.local and fill in your Supabase anon key.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
