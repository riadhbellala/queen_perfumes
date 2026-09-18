"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/shop/locale-switcher";
import { CartProvider, useCart } from "@/context/CartContext";
import { InstagramIcon, TikTokIcon } from "@/components/shop/social-icons";
import { WhatsAppIcon } from "@/components/shop/whatsapp-icon";
import { WhatsAppButton } from "@/components/shop/whatsapp-button";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Menu, X, ShoppingBag } from "lucide-react";

function CartLink({ onClick }: { onClick?: () => void }) {
  const { itemCount } = useCart();
  const locale = useLocale();
  const tNav = useTranslations("Navigation");

  return (
    <Link
      href={`/${locale}/panier`}
      onClick={onClick}
      aria-label={tNav("cart")}
      className="relative p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
    >
      <ShoppingBag className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center">
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
      className={`text-[15px] font-medium tracking-wide transition-colors hover:text-zinc-900 ${
        isActive
          ? "text-zinc-900"
          : "text-zinc-400"
      }`}
    >
      {children}
    </Link>
  );
}

function DrawerLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = isNavLinkActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-3.5 rounded-xl font-heading text-lg transition-colors ${
        isActive ? "bg-zinc-900 text-white font-semibold" : "text-zinc-700 hover:bg-zinc-50"
      }`}
    >
      {children}
    </Link>
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

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  return (
    <CartProvider>
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 -ms-2 text-zinc-600 hover:text-zinc-900 transition-colors"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
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
          <div className="flex items-center gap-1">
            <CartLink />
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      {/* Side Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Side Drawer Panel — slides in from the reading-start edge (left for fr, right for ar) */}
      <div
        className={`fixed top-0 start-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isDrawerOpen ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <img
            src="/assets/logo/tqp-logo-.png"
            alt="The Queen of Perfumes"
            className="h-10 w-auto"
          />
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="flex flex-col gap-1 px-3 pt-6">
          <DrawerLink href={`/${locale}`} onClick={() => setIsDrawerOpen(false)}>
            {tNav("home")}
          </DrawerLink>
          <DrawerLink href={`/${locale}/boxes`} onClick={() => setIsDrawerOpen(false)}>
            {tNav("packs")}
          </DrawerLink>
          <DrawerLink href={`/${locale}/creez-votre-box`} onClick={() => setIsDrawerOpen(false)}>
            {tNav("buildYourPack")}
          </DrawerLink>
          <DrawerLink href={`/${locale}/panier`} onClick={() => setIsDrawerOpen(false)}>
            {tNav("cart")}
          </DrawerLink>
        </nav>

        {/* Drawer Footer */}
        <div className="absolute bottom-8 start-0 w-full px-8">
          <LocaleSwitcher />
        </div>
      </div>

      {/* Page content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2">
            <img
              src="/assets/logo/tqp-logo-.png"
              alt="The Queen of Perfumes"
              className="h-11 w-auto"
            />
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-zinc-500">
            <Link href={`/${locale}`} className="hover:text-zinc-900 transition-colors">
              {tNav("home")}
            </Link>
            <Link href={`/${locale}/boxes`} className="hover:text-zinc-900 transition-colors">
              {tNav("packs")}
            </Link>
            <Link href={`/${locale}/creez-votre-box`} className="hover:text-zinc-900 transition-colors">
              {tNav("buildYourPack")}
            </Link>
            <Link href={`/${locale}/panier`} className="hover:text-zinc-900 transition-colors">
              {tNav("cart")}
            </Link>
          </nav>

          <a
            href={getWhatsAppUrl(tWhatsapp("message"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
          >
            <WhatsAppIcon className="size-4" />
            {tWhatsapp("cta")}
          </a>

          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="grid size-10 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white hover:border-zinc-900"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="grid size-10 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white hover:border-zinc-900"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="h-px w-16 bg-zinc-100" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-zinc-400 tracking-wide">
              {tFooter("text", { year: new Date().getFullYear() })}
            </p>
            <Link
              href="/admin/login"
              className="text-xs text-zinc-300 tracking-wide transition-colors hover:text-zinc-500"
            >
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
