-- ============================================================
-- LabFind — Supabase Setup Script
-- ============================================================
-- Run this in the Supabase SQL Editor (dashboard → SQL Editor → New query).
-- Execute STEP 1 first, then STEP 2, then STEP 3.
-- This is safe to re-run: all statements use IF NOT EXISTS / OR REPLACE.
-- ============================================================


-- ============================================================
-- STEP 1: SCHEMA
-- ============================================================
-- This creates all 8 tables and the AppointmentStage enum.
-- Identical to the Prisma migration (prisma/migrations/20261020142036_init/migration.sql).
-- Skip this step if you ran "prisma migrate deploy" against Supabase directly.
-- ============================================================

-- Enum for appointment lifecycle
DO $$ BEGIN
  CREATE TYPE "AppointmentStage" AS ENUM (
    'REQUESTED',
    'APPROVED',
    'SCHEDULED',
    'COLLECTOR_ASSIGNED',
    'ON_THE_WAY',
    'SAMPLE_COLLECTED',
    'COMPLETED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Canonical test catalog
CREATE TABLE IF NOT EXISTS "tests" (
    "id"              TEXT        NOT NULL,
    "name"            TEXT        NOT NULL,
    "aliases"         TEXT[]      NOT NULL DEFAULT '{}',
    "category"        TEXT        NOT NULL,
    "sampleType"      TEXT        NOT NULL,
    "fastingRequired" BOOLEAN     NOT NULL DEFAULT false,
    "preparation"     TEXT,
    "reportTimeHours" INTEGER     NOT NULL,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- Laboratory directory
CREATE TABLE IF NOT EXISTS "labs" (
    "id"                     TEXT             NOT NULL,
    "name"                   TEXT             NOT NULL,
    "tagline"                TEXT             NOT NULL,
    "area"                   TEXT             NOT NULL,
    "city"                   TEXT             NOT NULL,
    "addressLine"            TEXT             NOT NULL,
    "lat"                    DOUBLE PRECISION NOT NULL,
    "lng"                    DOUBLE PRECISION NOT NULL,
    "distanceKm"             DOUBLE PRECISION NOT NULL,
    "rating"                 DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount"            INTEGER          NOT NULL DEFAULT 0,
    "verified"               BOOLEAN          NOT NULL DEFAULT false,
    "accreditations"         TEXT[]           NOT NULL DEFAULT '{}',
    "facilities"             TEXT[]           NOT NULL DEFAULT '{}',
    "homeCollection"         BOOLEAN          NOT NULL DEFAULT false,
    "homeCollectionFee"      INTEGER          NOT NULL DEFAULT 0,
    "homeCollectionMinOrder" INTEGER          NOT NULL DEFAULT 0,
    "earliestSlot"           TEXT             NOT NULL,
    "openToday"              TEXT             NOT NULL,
    "createdAt"              TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"              TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

-- Lab-specific test pricing (many-to-many)
CREATE TABLE IF NOT EXISTS "lab_tests" (
    "id"              TEXT         NOT NULL,
    "labId"           TEXT         NOT NULL,
    "testId"          TEXT         NOT NULL,
    "labName"         TEXT         NOT NULL,
    "price"           INTEGER      NOT NULL,  -- stored in paise (÷100 = rupees)
    "reportTimeHours" INTEGER      NOT NULL,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lab_tests_pkey" PRIMARY KEY ("id")
);

-- Operating hours
CREATE TABLE IF NOT EXISTS "lab_hours" (
    "id"        TEXT         NOT NULL,
    "labId"     TEXT         NOT NULL,
    "day"       TEXT         NOT NULL,
    "open"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lab_hours_pkey" PRIMARY KEY ("id")
);

-- Lab reviews
CREATE TABLE IF NOT EXISTS "reviews" (
    "id"        TEXT         NOT NULL,
    "labId"     TEXT         NOT NULL,
    "author"    TEXT         NOT NULL,
    "rating"    INTEGER      NOT NULL,
    "date"      TEXT         NOT NULL,
    "body"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- Appointments (created by booking flow — empty until Milestone 4)
CREATE TABLE IF NOT EXISTS "appointments" (
    "id"             TEXT                NOT NULL,
    "labId"          TEXT                NOT NULL,
    "labName"        TEXT                NOT NULL,
    "labArea"        TEXT                NOT NULL,
    "patientName"    TEXT                NOT NULL,
    "mode"           TEXT                NOT NULL,
    "address"        TEXT,
    "date"           TEXT                NOT NULL,
    "slot"           TEXT                NOT NULL,
    "subtotal"       INTEGER             NOT NULL,
    "collectionFee"  INTEGER             NOT NULL DEFAULT 0,
    "total"          INTEGER             NOT NULL,
    "stage"          "AppointmentStage"  NOT NULL DEFAULT 'REQUESTED',
    "collectorName"  TEXT,
    "collectorPhone" TEXT,
    "collectorEta"   TEXT,
    "reportUrl"      TEXT,
    "createdAt"      TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- Tests within an appointment
CREATE TABLE IF NOT EXISTS "appointment_tests" (
    "id"            TEXT         NOT NULL,
    "appointmentId" TEXT         NOT NULL,
    "testId"        TEXT         NOT NULL,
    "name"          TEXT         NOT NULL,
    "price"         INTEGER      NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appointment_tests_pkey" PRIMARY KEY ("id")
);

-- Appointment lifecycle events
CREATE TABLE IF NOT EXISTS "appointment_events" (
    "id"            TEXT                NOT NULL,
    "appointmentId" TEXT                NOT NULL,
    "stage"         "AppointmentStage"  NOT NULL,
    "at"            TEXT                NOT NULL,
    "note"          TEXT,
    "createdAt"     TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appointment_events_pkey" PRIMARY KEY ("id")
);

-- Unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "lab_tests_labId_testId_key" ON "lab_tests"("labId", "testId");
CREATE UNIQUE INDEX IF NOT EXISTS "lab_hours_labId_day_key"    ON "lab_hours"("labId", "day");

-- Foreign keys
DO $$ BEGIN
  ALTER TABLE "lab_tests"
    ADD CONSTRAINT "lab_tests_labId_fkey"
    FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "lab_tests"
    ADD CONSTRAINT "lab_tests_testId_fkey"
    FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "lab_hours"
    ADD CONSTRAINT "lab_hours_labId_fkey"
    FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_labId_fkey"
    FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "appointments"
    ADD CONSTRAINT "appointments_labId_fkey"
    FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "appointment_tests"
    ADD CONSTRAINT "appointment_tests_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "appointment_events"
    ADD CONSTRAINT "appointment_events_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- STEP 2: ROW-LEVEL SECURITY
-- ============================================================
-- Enable RLS on every table, then grant public SELECT on the five
-- read-only tables. Appointment tables have no public SELECT policy —
-- they will require authentication (added in Milestone 4).
-- ============================================================

ALTER TABLE "tests"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "labs"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lab_tests"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lab_hours"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointment_tests"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointment_events" ENABLE ROW LEVEL SECURITY;

-- Public read-only policies (anon + authenticated)
DROP POLICY IF EXISTS "public read tests"     ON "tests";
DROP POLICY IF EXISTS "public read labs"      ON "labs";
DROP POLICY IF EXISTS "public read lab_tests" ON "lab_tests";
DROP POLICY IF EXISTS "public read lab_hours" ON "lab_hours";
DROP POLICY IF EXISTS "public read reviews"   ON "reviews";

CREATE POLICY "public read tests"
  ON "tests" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public read labs"
  ON "labs" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public read lab_tests"
  ON "lab_tests" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public read lab_hours"
  ON "lab_hours" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public read reviews"
  ON "reviews" FOR SELECT TO anon, authenticated USING (true);

-- Appointment tables: no public SELECT (auth required — Milestone 4)
-- No INSERT/UPDATE/DELETE policies for any table from the frontend.


-- ============================================================
-- STEP 3: VERIFY
-- ============================================================
-- Run this after Steps 1 and 2 to confirm the setup is correct.
-- Expected: 8 rows (one per table), all 5 read-only tables show rls_enabled=true and a policy.
-- ============================================================

SELECT
  t.table_name,
  c.relrowsecurity                         AS rls_enabled,
  COUNT(p.policyname)                      AS policy_count,
  (SELECT COUNT(*) FROM information_schema.columns col
   WHERE col.table_schema = 'public' AND col.table_name = t.table_name) AS column_count
FROM information_schema.tables t
JOIN pg_class c
  ON c.relname = t.table_name
  AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
LEFT JOIN pg_policies p
  ON p.tablename = t.table_name AND p.schemaname = 'public'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name, c.relrowsecurity
ORDER BY t.table_name;
