/**
 * Supabase Auth API wrapper.
 *
 * All auth operations go through this module — never call supabase.auth.*
 * directly from components. This keeps the surface area small and error
 * handling consistent.
 *
 * Service-role key is never used here. The anon key is sufficient for all
 * client-side auth operations.
 */

import { supabase } from "@/lib/supabase";
import type { Session, User } from "@/lib/supabase.types";

// ── Types ─────────────────────────────────────────────────────────────────

export interface AuthError {
  message: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function normaliseError(err: unknown): AuthError {
  if (err && typeof err === "object" && "message" in err) {
    return { message: String((err as { message: unknown }).message) };
  }
  return { message: "An unexpected error occurred." };
}

// ── Auth operations ───────────────────────────────────────────────────────

/**
 * Create a new account. Passes fullName in user_metadata so the
 * handle_new_user trigger can write it to the profiles table.
 */
export async function signUp(
  input: SignUpInput,
): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: { full_name: input.fullName.trim() },
    },
  });
  if (error) return { user: null, error: normaliseError(error) };
  return { user: data.user, error: null };
}

/**
 * Sign in with email + password.
 */
export async function signIn(
  input: SignInInput,
): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  if (error) return { session: null, error: normaliseError(error) };
  return { session: data.session, error: null };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? normaliseError(error) : null };
}

/**
 * Send a password-reset email. The link redirects to /auth/callback
 * which then shows the reset-password form.
 */
export async function resetPassword(
  email: string,
  redirectTo: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo },
  );
  return { error: error ? normaliseError(error) : null };
}

/**
 * Update password — called after the user follows the reset link.
 * The user must have an active recovery session.
 */
export async function updatePassword(
  newPassword: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error ? normaliseError(error) : null };
}

/**
 * Get the current session from local storage (synchronous-ish via SDK cache).
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Fetch the profiles row for the given user id.
 * Returns null if no row exists yet (first sign-in before trigger fires).
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,phone,created_at,updated_at")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as Profile;
}

/**
 * Update the current user's profile fields.
 */
export async function updateProfile(
  userId: string,
  patch: { full_name?: string; phone?: string | null },
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId);
  return { error: error ? normaliseError(error) : null };
}
