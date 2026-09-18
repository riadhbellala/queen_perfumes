"use client";

import { useTranslations } from "next-intl";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/shop/whatsapp-icon";

// Floating chat bubble, shown on every storefront page. Deliberately pinned
// to the physical bottom-right in both fr and ar — unlike the rest of this
// codebase's RTL-aware logical positioning, a WhatsApp bubble is a globally
// recognized fixed-corner convention independent of reading direction.
export function WhatsAppButton() {
  const t = useTranslations("Whatsapp");

  return (
    <a
      href={getWhatsAppUrl(t("message"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("cta")}
      className="fixed right-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:right-6"
      style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
