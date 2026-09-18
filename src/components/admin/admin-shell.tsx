"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/admin/logout-button";
import {
  LayoutDashboard,
  FlaskConical,
  Package,
  ClipboardList,
  Tag,
  Truck,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/parfums", label: "Parfums", icon: FlaskConical },
  { href: "/admin/boxes", label: "Boxes", icon: Package },
  { href: "/admin/commandes", label: "Commandes", icon: ClipboardList },
  { href: "/admin/tarifs", label: "Tarifs", icon: Tag },
  { href: "/admin/livraison", label: "Livraison", icon: Truck },
];

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  // "/admin" is a prefix of every other admin route, so only treat it as
  // active on an exact match; deeper routes match on a real sub-path.
  return href !== "/admin" && pathname.startsWith(href + "/");
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-amber-50 text-amber-900" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar — fixed, always visible, not collapsible */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:border-zinc-200 md:bg-white">
        <div className="border-b border-zinc-100 p-6">
          <p className="text-sm font-semibold text-zinc-900">The Queen of Perfumes</p>
          <p className="text-xs text-zinc-500">Administration</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks pathname={pathname} />
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} />
            </Button>
            <p className="text-sm font-semibold text-zinc-900">Administration</p>
          </div>
          <div className="hidden md:block" />
          <LogoutButton />
        </header>

        <main className="p-4 sm:p-6 md:p-8">{children}</main>
      </div>

      {/* Mobile nav drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-zinc-100 p-6">
            <SheetTitle>The Queen of Perfumes</SheetTitle>
            <p className="text-xs text-zinc-500">Administration</p>
          </SheetHeader>
          <div className="p-3">
            <NavLinks pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
