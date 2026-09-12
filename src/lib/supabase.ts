import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your project values.'
  );
}

const SESSION_KEY = 'unwrapped_dashboard_session';

function buildClient(token: string | null): SupabaseClient {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: token ? { 'x-session-token': token } : {},
    },
  });
}

// `supabase` is intentionally `let` + re-exported live: importers see the
// current client (with the right auth header) without needing to re-import.
export let supabase: SupabaseClient = buildClient(getStoredSessionToken());

export function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function getStoredSessionSurpriseId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY + '_surprise_id');
  } catch {
    return null;
  }
}

/**
 * Sets (or clears) the active dashboard session. This never stores the
 * creator's password or password hash — only an opaque, time-limited
 * session token issued by the `verify_dashboard_password` RPC.
 */
export function setDashboardSession(token: string | null, surpriseId: string | null) {
  try {
    if (token && surpriseId) {
      localStorage.setItem(SESSION_KEY, token);
      localStorage.setItem(SESSION_KEY + '_surprise_id', surpriseId);
    } else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY + '_surprise_id');
    }
  } catch {
    // ignore storage errors (private browsing etc.)
  }
  supabase = buildClient(token);
}
