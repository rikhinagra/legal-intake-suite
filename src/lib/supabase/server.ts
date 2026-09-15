import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client bound to the current request's session cookie.
 * Queries made with this client run AS the logged-in user, so Row Level
 * Security policies see their real role (agent/attorney/admin) — this is
 * what the agent portal and attorney dashboard should use, never the public
 * anon client from public-client.ts.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component that can't set cookies directly;
            // the proxy (middleware) already refreshes the session, so this is safe to ignore.
          }
        },
      },
    }
  );
}
