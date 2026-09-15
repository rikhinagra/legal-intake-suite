import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Internal staff tools (agent portal, attorney dashboard, auth pages) are
// English-only and live outside the [locale] segment, so next-intl's
// locale-prefix logic should never run for them.
const STAFF_PATHS = ["/agent", "/dashboard", "/login", "/signup"];

export default async function proxy(request: NextRequest) {
  const isStaffPath = STAFF_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));
  const response = isStaffPath ? NextResponse.next({ request }) : intlMiddleware(request);

  // Refreshing the Supabase session cookie here (rather than only in Server
  // Components) is required by @supabase/ssr — without it, sessions expire
  // silently. See https://supabase.com/docs/guides/auth/server-side/nextjs
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
