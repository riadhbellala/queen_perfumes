import { createClient } from "@supabase/supabase-js";

// A plain anon client for the storefront's public, read-only catalog
// queries. Deliberately NOT `./server.ts`'s cookie-based client — that one
// calls Next's `cookies()`, which is a "dynamic API" that forces every page
// touching it to render fully dynamically on *every* request, bypassing any
// `export const revalidate`. That's correct for admin (it needs the live
// session, via RLS's `authenticated` role, to see/edit inactive rows), but
// wasteful for the storefront: it's 100% guest/anon (no customer accounts
// anywhere in this app) and only ever reads `is_active = true` rows anon
// can already see, so there's nothing session-dependent to lose by using a
// plain client here — and doing so is what actually lets these pages be
// ISR-cached instead of hitting Supabase on every single request.
//
// Safe to keep as one module-scope instance (unlike the per-request cookie
// client) since it carries no per-request state.
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
