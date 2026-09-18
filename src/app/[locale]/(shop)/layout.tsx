"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/shop/locale-switcher";
import { CartProvider, useCart } from "@/context/CartContext";
import { InstagramIcon, TikTokIcon } from "@/components/shop/social-icons";
import { WhatsAppIcon } from "@/components/shop/whatsapp-icon";
import { WhatsAppButton } from "@/components/shop/whatsapp-button";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, X, Search, ShoppingBag, LogIn } from "lucide-react";

function CartLink({ onClick }: { onClick?: () => void }) {
  const { itemCount } = useCart();
  const locale = useLocale();
  const tNav = useTranslations("Navigation");

  return (
    <Link
      href={`/${locale}/panier`}
      onClick={onClick}
      aria-label={tNav("cart")}
      className="relative p-2 text-foreground/60 hover:text-foreground transition-colors"
    >
      <ShoppingBag className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          <bdi dir="ltr">{itemCount}</bdi>
        </span>
      )}
    </Link>
  );
}

function isNavLinkActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  // A bare locale root (e.g. "/fr") is a prefix of every other route, so only
  // treat sub-paths as a match once href points somewhere deeper than that.
  const hasSubPath = href.split("/").filter(Boolean).length > 1;
  return hasSubPath && pathname.startsWith(href + "/");
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = isNavLinkActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative py-1 text-[15px] font-medium tracking-wide transition-colors hover:text-foreground ${
        isActive ? "text-foreground" : "text-foreground/45"
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 start-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
      )}
    </Link>
  );
}

function DrawerLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = isNavLinkActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-6 py-4 font-display text-base transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground font-semibold"
          : "text-foreground/75 hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

function DrawerSearchForm({ onNavigate }: { onNavigate: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const tNav = useTranslations("Navigation");
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(`/${locale}/parfums${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    onNavigate();
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-foreground/35"
          size={16}
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={tNav("searchPlaceholder")}
          aria-label={tNav("searchPlaceholder")}
          className="w-full rounded-full border border-border bg-muted/60 py-2.5 ps-10 pe-4 text-sm text-foreground placeholder:text-zinc-400 outline-none transition-colors focus:border-primary focus:bg-background"
        />
      </div>
    </form>
  );
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const tNav = useTranslations("Navigation");
  const tFooter = useTranslations("Footer");
  const tWhatsapp = useTranslations("Whatsapp");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on route change
  const pathname = usePathname();
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const navItems: { href: string; label: string }[] = [
    { href: `/${locale}`, label: tNav("home") },
    { href: `/${locale}/boxes`, label: tNav("packs") },
    { href: `/${locale}/creez-votre-box`, label: tNav("buildYourPack") },
    { href: `/${locale}/panier`, label: tNav("cart") },
  ];

  return (
    <CartProvider>
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden -ms-2 flex items-center justify-center rounded-full p-2.5 text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo — centered on mobile */}
          <Link href={`/${locale}`} className="shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0">
            <img
              src="/assets/logo/tqp-logo-.png"
              alt="The Queen of Perfumes"
              className="h-14 md:h-16 w-auto"
            />
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-10 font-heading">
            <NavLink href={`/${locale}`}>{tNav("home")}</NavLink>
            <NavLink href={`/${locale}/boxes`}>{tNav("packs")}</NavLink>
            <NavLink href={`/${locale}/creez-votre-box`}>{tNav("buildYourPack")}</NavLink>
          </nav>

          {/* Cart + Locale switcher */}
          <div className="flex items-center gap-2.5">
            <CartLink />
            <div className="h-5 w-px bg-border" />
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile nav drawer — built on the shared Sheet primitive (same one
          the /parfums filter drawer already uses) instead of a hand-rolled
          fixed/overlay pair: gets focus-trap, ESC-to-close and outside-click
          for free, and `side` already resolves left/right correctly per
          locale the same way the filter Sheet does. */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side={isRtl ? "right" : "left"}
          showCloseButton={false}
          className="w-[20rem] max-w-[85vw] gap-0 bg-background p-0 sm:max-w-[20rem]"
        >
          {/* Header: logo (sized up — a real wordmark moment, not a small
              utility label) + close control in the corner */}
          <div className="flex shrink-0 items-center justify-between px-6 py-5 border-b border-border">
            <img src="/assets/logo/tqp-logo-.png" alt="The Queen of Perfumes" className="h-16 w-auto" />
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-foreground/40 hover:text-foreground transition-colors rounded-full hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-5">
            <DrawerSearchForm onNavigate={() => setIsDrawerOpen(false)} />
          </div>

          {/* Nav list — every item separated by a thin sand divider,
              generous padding, serif labels, gold pill on the active page */}
          <nav
            key={isDrawerOpen ? "open" : "closed"}
            className="stagger-fade flex flex-1 flex-col divide-y divide-border overflow-y-auto border-t border-border"
          >
            {navItems.map((item) => (
              <DrawerLink key={item.href} href={item.href} onClick={() => setIsDrawerOpen(false)}>
                {item.label}
              </DrawerLink>
            ))}
          </nav>

          {/* Footer: social icons, outlined circles in the gold accent */}
          <div className="shrink-0 border-t border-border px-6 py-6">
            <div className="flex items-center justify-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="grid size-11 place-items-center rounded-full border border-border text-foreground/60 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                <InstagramIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="grid size-11 place-items-center rounded-full border border-border text-foreground/60 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                <TikTokIcon className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Page content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2">
            <img
              src="/assets/logo/tqp-logo-.png"
              alt="The Queen of Perfumes"
              className="h-16 w-auto"
            />
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-zinc-500">
            <Link href={`/${locale}`} className="hover:text-foreground transition-colors">
              {tNav("home")}
            </Link>
            <Link href={`/${locale}/boxes`} className="hover:text-foreground transition-colors">
              {tNav("packs")}
            </Link>
            <Link href={`/${locale}/creez-votre-box`} className="hover:text-foreground transition-colors">
              {tNav("buildYourPack")}
            </Link>
            <Link href={`/${locale}/panier`} className="hover:text-foreground transition-colors">
              {tNav("cart")}
            </Link>
          </nav>

          <a
            href={getWhatsAppUrl(tWhatsapp("message"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
          >
            <WhatsAppIcon className="size-4" />
            {tWhatsapp("cta")}
          </a>

          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="grid size-10 place-items-center rounded-full border border-border text-zinc-500 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="grid size-10 place-items-center rounded-full border border-border text-zinc-500 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="h-px w-16 bg-border" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-zinc-400 tracking-wide">
              {tFooter("text", { year: new Date().getFullYear() })}
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <LogIn size={16} />
              {tFooter("adminLogin")}
            </Link>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
    </CartProvider>
  );
}
