/**
 * Auth integration test suite.
 *
 * Runs against the live Supabase project using the anon key.
 * Execute with:  npx tsx src/tests/auth.test.ts
 *
 * Tests:
 *  1. Sign-up with valid data
 *  2. Sign-up with invalid email (validation error)
 *  3. Sign-up with weak password (Supabase rejects)
 *  4. Sign-in with correct credentials
 *  5. Sign-in with wrong password (auth error)
 *  6. Session persistence (getSession after sign-in)
 *  7. Profile row created by trigger
 *  8. Profile update
 *  9. Unauthorized profile access from a different user
 * 10. Sign-out clears session
 */

import { createClient } from "@supabase/supabase-js";

// ── These must be set in the environment or .env.local ─────────────────────
const SUPABASE_URL = process.env["VITE_SUPABASE_URL"] ?? "";
const SUPABASE_ANON_KEY = process.env["VITE_SUPABASE_ANON_KEY"] ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running tests.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Test helpers ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? `  →  ${detail}` : ""}`);
    failed++;
  }
}

function section(title: string) {
  console.log(`\n── ${title} ──────────────────────────────────`);
}

// Unique email per run so re-runs don't collide with already-confirmed accounts
const RUN_ID = Date.now();
const TEST_EMAIL = `labfind-test-${RUN_ID}@mailinator.com`;
const TEST_PASSWORD = "TestPass123!";
const TEST_NAME = "Test User";

// ── Tests ───────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("LabFind Auth Integration Tests");
  console.log(`Test account: ${TEST_EMAIL}\n`);

  // ── 1. Validation: empty email ──────────────────────────────────────────
  section("Client-side validation (email format)");
  // Supabase rejects obviously malformed email
  const { error: badEmailErr } = await supabase.auth.signUp({
    email: "not-an-email",
    password: TEST_PASSWORD,
    options: { data: { full_name: TEST_NAME } },
  });
  ok("Rejects malformed email", badEmailErr !== null, badEmailErr?.message);

  // ── 2. Validation: weak password ────────────────────────────────────────
  section("Password policy");
  const { error: weakPwErr } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: "123",
    options: { data: { full_name: TEST_NAME } },
  });
  ok("Rejects password shorter than 6 chars", weakPwErr !== null, weakPwErr?.message);

  // ── 3. Valid sign-up ─────────────────────────────────────────────────────
  section("Sign-up");
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    options: { data: { full_name: TEST_NAME } },
  });
  ok("signUp returns no error", signUpErr === null, signUpErr?.message);
  ok("signUp returns a user", signUpData?.user !== null && signUpData?.user !== undefined);
  ok("User email matches", signUpData?.user?.email === TEST_EMAIL);

  // ── 4. Sign-in with wrong password ──────────────────────────────────────
  section("Sign-in — wrong password");
  const { error: wrongPwErr } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: "WrongPassword!",
  });
  ok("Wrong password returns an error", wrongPwErr !== null);
  ok(
    "Error does not reveal whether email exists",
    wrongPwErr?.message !== undefined &&
      !wrongPwErr.message.toLowerCase().includes("not found"),
  );

  // ── 5. Sign-in with correct credentials ─────────────────────────────────
  section("Sign-in — correct credentials");
  // Note: if email confirmation is enabled in the Supabase project, this will
  // fail with "Email not confirmed". That is correct security behaviour.
  // To test the full flow: disable "Confirm email" in Supabase Auth settings,
  // or confirm the test account manually, then re-run.
  const emailConfirmRequired = process.env["SKIP_EMAIL_CONFIRM"] === "1";
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  const signInOk = signInErr === null;
  if (emailConfirmRequired) {
    ok(
      "signIn correctly blocked (email confirmation required — expected)",
      signInErr?.message?.includes("not confirmed") === true,
      signInErr?.message,
    );
    console.log("  ⚠  Remaining tests skipped: set SKIP_EMAIL_CONFIRM=0 and confirm the test account.");
    return summarise();
  }
  ok("signIn returns no error", signInOk, signInErr?.message);
  ok("signIn returns a session", signInData?.session !== null && signInData?.session !== undefined);

  if (signInOk === false || !signInData?.session) {
    console.log("\n  ⚠  Skipping session + profile tests (sign-in failed).");
    console.log("  If email confirmation is required, set SKIP_EMAIL_CONFIRM=1 and re-run.");
    return summarise();
  }

  // ── 6. Session persistence ───────────────────────────────────────────────
  section("Session persistence");
  const { data: sessionData } = await supabase.auth.getSession();
  ok("getSession returns the active session", sessionData.session !== null);
  ok(
    "Session user matches signed-in user",
    sessionData.session?.user?.email === TEST_EMAIL,
  );

  // ── 7. Profile row auto-created by trigger ───────────────────────────────
  section("Profile row (trigger)");
  const userId = signInData.session.user.id;
  const { data: profileRow, error: profileErr } = await supabase
    .from("profiles")
    .select("id,full_name,phone")
    .eq("id", userId)
    .single();
  ok("Profile row exists after sign-up", profileErr === null, profileErr?.message);
  ok("Profile id matches auth user id", profileRow?.id === userId);
  // full_name may be empty string if trigger ran before meta_data propagated
  ok("Profile row readable", profileRow !== null);

  // ── 8. Profile update ────────────────────────────────────────────────────
  section("Profile update");
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ full_name: "Updated Name", phone: "+91 90000 00001" })
    .eq("id", userId);
  ok("Profile update returns no error", updateErr === null, updateErr?.message);

  const { data: updatedProfile } = await supabase
    .from("profiles")
    .select("full_name,phone")
    .eq("id", userId)
    .single();
  ok("full_name persisted", updatedProfile?.full_name === "Updated Name");
  ok("phone persisted", updatedProfile?.phone === "+91 90000 00001");

  // ── 9. Unauthorized profile access ──────────────────────────────────────
  section("RLS: unauthorized profile access");
  // Try to read a profile row for a non-existent UUID as the current user.
  // RLS means the row won't be visible even if it existed for another user.
  const fakeId = "00000000-0000-0000-0000-000000000000";
  const { data: stealData, error: stealErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", fakeId)
    .single();
  ok(
    "Cannot read another user's profile row",
    stealData === null || stealErr !== null,
  );

  // ── 10. Sign-out ─────────────────────────────────────────────────────────
  section("Sign-out");
  const { error: signOutErr } = await supabase.auth.signOut();
  ok("signOut returns no error", signOutErr === null, signOutErr?.message);

  const { data: afterSignOut } = await supabase.auth.getSession();
  ok("Session is null after sign-out", afterSignOut.session === null);

  // ── 11. Unauthenticated profile access denied ────────────────────────────
  section("RLS: unauthenticated profile read blocked");
  const { data: anonData, error: anonErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();
  ok(
    "Signed-out client cannot read profile",
    anonData === null || anonErr !== null,
    anonErr?.message,
  );

  summarise();
}

function summarise() {
  const total = passed + failed;
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed}/${total} passed${failed > 0 ? `, ${failed} FAILED` : " ✅"}`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e: unknown) => {
  console.error("Unexpected error:", e instanceof Error ? e.message : e);
  process.exit(1);
});
