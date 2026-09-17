"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname?.split('/')[1] || 'ar';

  const switchLocale = (newLocale: string) => {
    if (!pathname) return;
    if (newLocale === currentLocale) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const otherLocale = currentLocale === 'ar' ? 'fr' : 'ar';
  const label = currentLocale === 'ar' ? 'Français' : 'العربية';

  return (
    <button
      onClick={() => switchLocale(otherLocale)}
      className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-zinc-50 hover:bg-zinc-100 px-4 py-2 rounded-full border border-zinc-200"
      dir="ltr"
    >
      <Globe className="w-4 h-4 opacity-70" />
      <span>{label}</span>
    </button>
  );
}
