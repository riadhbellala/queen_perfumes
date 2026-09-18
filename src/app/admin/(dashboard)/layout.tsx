import { AdminShell } from "@/components/admin/admin-shell";

// Everything under (dashboard) is protected by src/middleware.ts (redirects
// to /admin/login without a valid Supabase session) and gets the sidebar +
// topbar chrome. /admin/login sits outside this group deliberately, so the
// login screen itself never shows the dashboard shell.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
