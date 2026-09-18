"use client";

import { usePathname, useRouter } from "next/navigation";

const LOCALES = [
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
] as const;

// A small fr/ar segmented toggle — deliberately compact on every screen
// size, not just mobile. Shows both codes at once (rather than "click to
// switch to the other one") so the current locale is always legible too.
export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname?.split("/")[1] || "ar";

  function switchLocale(newLocale: string) {
    if (!pathname || newLocale === currentLocale) return;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div
      dir="ltr"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-muted/60 p-0.5"
    >
      {LOCALES.map(({ code, label }) => {
        const isActive = code === currentLocale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            aria-current={isActive}
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-zinc-400 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
