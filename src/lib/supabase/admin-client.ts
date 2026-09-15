import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Uses the secret key — bypasses Row Level Security entirely. Only ever for
 * trusted, server-only, system-level operations (looking up staff emails to
 * send notifications, creating staff accounts). NEVER import this from a
 * client component, and never use it to serve data back to a request based
 * on a user's own permissions — that's what server.ts (session-aware) and
 * public-client.ts (anon) are for.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
