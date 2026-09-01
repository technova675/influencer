import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local and restart the dev server.`,
    );
  }
  return value;
}

/**
 * How long everything one client is asked to do may take before it is
 * abandoned.
 *
 * Without a deadline a stalled connection - a paused project, a dropped
 * network, a slow region - never rejects, and a page that reads the database
 * simply never finishes rendering. Callers guard their queries with `.catch()`
 * or `try`, but a `catch` only ever runs on a rejection: a request that hangs
 * forever hangs the page forever, and the browser sits on a spinner with
 * nothing to show for it. The deadline is what turns "hangs" into "fails",
 * which every caller already knows how to handle - the roster shows its error
 * state, and the pages that treat stats as optional fall back to dashes.
 *
 * Eight seconds is far longer than a healthy query needs and short enough that
 * a broken one surfaces as broken.
 *
 * The wall-clock ceiling is higher than this number, and knowing by how much
 * matters if you ever tune it. supabase-js makes four attempts, and once the
 * deadline has passed attempts two to four reject instantly but still serve
 * their 1s / 2s / 4s backoff waits first. So the worst case a visitor waits is
 * roughly DEADLINE_MS + 7s - measured at 17s when this was set to 10s. Eight
 * puts the ceiling around fifteen.
 */
const DEADLINE_MS = 8_000;

/**
 * One deadline per client, shared by every request that client makes.
 *
 * Deliberately not a per-request timeout. supabase-js retries internally -
 * four attempts against an unreachable host - so a per-request timeout is
 * multiplied by the retry count and the caller waits several times longer than
 * the number suggests. A single signal created with the client and shared
 * across every attempt is what bounds the whole operation rather than each
 * attempt within it.
 *
 * This is safe only because every client here is created at its point of use
 * and used immediately, for one logical operation - a client held across a
 * longer scope would start rejecting once its deadline passed.
 *
 * `AbortSignal.any` so an abort the caller already asked for still works:
 * dropping an incoming `signal` would break request cancellation when a visitor
 * navigates away mid-render.
 */
function deadlineFetch() {
  const deadline = AbortSignal.timeout(DEADLINE_MS);
  return (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      signal: init?.signal
        ? AbortSignal.any([init.signal, deadline])
        : deadline,
    });
}

/**
 * Anon client. Only ever used for INSERTs from the public creator form and for
 * uploading to the creator-media bucket - RLS allows nothing else.
 */
export function publicClient() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL", url),
    required("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey),
    { auth: { persistSession: false }, global: { fetch: deadlineFetch() } },
  );
}

/**
 * Service-role client. Bypasses RLS, so this must never be imported into a
 * Client Component. Server Components, Server Actions and Route Handlers only.
 */
export function adminClient() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL", url),
    required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    { auth: { persistSession: false }, global: { fetch: deadlineFetch() } },
  );
}
