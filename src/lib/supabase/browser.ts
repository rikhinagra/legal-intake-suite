import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client for client components (login form, logout
 * button). Shares the same session cookie the server client reads.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
