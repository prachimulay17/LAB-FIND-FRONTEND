-- ============================================================
-- LabFind Migration: user profiles
-- Run in Supabase Dashboard → SQL Editor, or via psql
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE
-- ============================================================

-- ── 1. profiles table linked to auth.users ──────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        NOT NULL,
  full_name    TEXT        NOT NULL DEFAULT '',
  phone        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- ── 2. Keep updated_at current ──────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. Auto-create profile row when a user signs up ─────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 4. Row-Level Security ────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read only their own profile
DROP POLICY IF EXISTS "users read own profile"   ON public.profiles;
CREATE POLICY "users read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert only their own profile row (belt-and-suspenders for trigger)
DROP POLICY IF EXISTS "users insert own profile" ON public.profiles;
CREATE POLICY "users insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No DELETE from frontend — handled by auth.users cascade

-- ── 5. Verify ────────────────────────────────────────────────
SELECT
  t.table_name,
  c.relrowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policies
FROM information_schema.tables t
JOIN pg_class c
  ON c.relname = t.table_name
  AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
LEFT JOIN pg_policies p
  ON p.tablename = t.table_name AND p.schemaname = 'public'
WHERE t.table_schema = 'public' AND t.table_name = 'profiles'
GROUP BY t.table_name, c.relrowsecurity;
