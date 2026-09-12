import { supabase, setDashboardSession, getStoredSessionToken, getStoredSessionSurpriseId } from './supabase';

export interface CreateSurpriseCredentials {
  creator_email: string;
  creator_password: string;
}

/**
 * Verifies a surprise_code + password pair via a Postgres RPC
 * (SECURITY DEFINER) that checks the bcrypt hash server-side and, on
 * success, mints a short-lived opaque session token. The password and
 * hash never leave the database.
 */
export async function verifyDashboardPassword(surpriseCode: string, password: string) {
  const { data, error } = await supabase.rpc('verify_dashboard_password', {
    p_surprise_code: surpriseCode.trim().toUpperCase(),
    p_password: password,
  });

  if (error) {
    return { ok: false as const, error: 'Something went wrong. Please try again.' };
  }
  if (!data) {
    return { ok: false as const, error: "That surprise ID and password don't match." };
  }

  const { session_token, surprise_id } = data as { session_token: string; surprise_id: string };
  setDashboardSession(session_token, surprise_id);
  return { ok: true as const, surpriseId: surprise_id };
}

export function hasActiveDashboardSession(surpriseId: string) {
  return getStoredSessionToken() !== null && getStoredSessionSurpriseId() === surpriseId;
}

export async function logoutDashboard() {
  const token = getStoredSessionToken();
  if (token) {
    try {
      await supabase.rpc('revoke_dashboard_session', { p_session_token: token });
    } catch {
      // ignore — we're logging out either way
    }
  }
  setDashboardSession(null, null);
}
