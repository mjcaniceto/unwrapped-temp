import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copy .env.example to .env and fill in your project values.'
  );
}

const SESSION_KEY = 'unwrapped_dashboard_session';
const SURPRISE_ID_KEY = `${SESSION_KEY}_surprise_id`;

export function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function getStoredSessionSurpriseId(): string | null {
  try {
    return localStorage.getItem(SURPRISE_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Custom fetch wrapper.
 *
 * The Supabase client is created only once. The current dashboard session
 * token is read from localStorage for each request, so changing the session
 * never requires recreating the Supabase client.
 */
const sessionFetch: typeof fetch = async (input, init = {}) => {
  const token = getStoredSessionToken();

  const headers = new Headers(init.headers);

  if (token) {
    headers.set('x-session-token', token);
  } else {
    headers.delete('x-session-token');
  }

  return fetch(input, {
    ...init,
    headers,
  });
};

/**
 * One and only one Supabase client instance.
 *
 * We do not use Supabase Auth. The dashboard uses its own
 * Surprise ID + password + session-token authentication system.
 */
export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: sessionFetch,
  },
});

/**
 * Sets (or clears) the active dashboard session.
 *
 * Only the opaque, time-limited session token is stored.
 * The creator's password/password hash is never stored here.
 *
 * IMPORTANT:
 * This function intentionally does NOT recreate the Supabase client.
 */
export function setDashboardSession(
  token: string | null,
  surpriseId: string | null
): void {
  try {
    if (token && surpriseId) {
      localStorage.setItem(SESSION_KEY, token);
      localStorage.setItem(SURPRISE_ID_KEY, surpriseId);
    } else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SURPRISE_ID_KEY);
    }
  } catch {
    // Ignore storage errors (private browsing, blocked storage, etc.).
  }
}