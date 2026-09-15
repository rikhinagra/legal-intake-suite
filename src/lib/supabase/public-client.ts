import { createClient } from "@supabase/supabase-js";

/**
 * Used for the public intake form, which has no logged-in user. Requests
 * made with this client hit the database as the `anon` role, so they only
 * succeed where a Row Level Security policy explicitly allows anonymous
 * access (see supabase/migrations — leads/injured_people insert policies).
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
