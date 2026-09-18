import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["fr", "ar"],
  defaultLocale: "ar",
});

// /admin has no locale segment and its own auth gate — keep it fully
// separate from the next-intl middleware rather than trying to make one
// middleware handle both concerns.
async function adminMiddleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() (not getSession()) revalidates the token against the auth
  // server, so a forged/expired cookie can't be used to pass this check.
  const { data: { user } } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(request);
  }
  return intlMiddleware(request);
}

export const config = {
  // The old matcher (`"/", "/(fr|ar)/:path*", "/admin/:path*"`) only ran the
  // middleware for the bare root and already-locale-prefixed paths — a bare
  // unprefixed deep link like /parfums never hit the middleware at all and
  // 404'd instead of being redirected to /fr/parfums. This catch-all runs
  // for everything except Next.js internals, static assets (anything with a
  // file extension), and /admin (handled by the second entry, matched here
  // too but excluded from the first so intl logic never double-processes it).
  matcher: ["/((?!api|_next|_vercel|admin(?:/|$)|.*\\..*).*)", "/admin/:path*"],
};
