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
 * Anon client. Only ever used for INSERTs from the public creator form and for
 * uploading to the creator-media bucket - RLS allows nothing else.
 */
export function publicClient() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL", url),
    required("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey),
    { auth: { persistSession: false } },
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
    { auth: { persistSession: false } },
  );
}
