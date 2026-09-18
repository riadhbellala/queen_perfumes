import React from "react";
import Link from "next/link";
import { Perfume, Pack } from "@/types";
import { Price } from "@/components/shop/price";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { cn } from "cn";

// A card is "new" for 14 days after its DB row was created — no admin toggle,
// no schema change, just a window off `created_at` that's already selected
// by every `select("*")` query. Tune this one constant if that window ever
// needs to change.
const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

interface ProductCardProps {
  product: Perfume | Pack;
  type: "perfume" | "pack";
}

function RibbonBadge({ label, tone }: { label: string; tone: "gold" | "muted" }) {
  return (
    <div className="absolute -start-10 top-4 z-10 w-36 ltr:-rotate-45 rtl:rotate-45">
      <div
        className={cn(
          "py-1 text-center text-[10px] font-semibold uppercase tracking-wider shadow-sm",
          tone === "gold" ? "bg-primary text-primary-foreground" : "bg-red-900/85 text-white"
        )}
      >
        {label}
      </div>
    </div>
  );
}

// Image-forward card used for both perfumes and boxes — one consistent card
// language across the whole catalog, not two different styles. The photo is
// the card (portrait 3:4, no border, no heavy shadow); the caption below it
// is centered and minimal (name + price only). Works as a grid cell
// (/parfums, /boxes) and as a carousel slide (BoxesCarousel) unchanged.
export function ProductCard({ product, type }: ProductCardProps) {
  const locale = useLocale() as "fr" | "ar";
  const t = useTranslations("Product");
  const isPerfume = type === "perfume";
  const perfume = isPerfume ? (product as Perfume) : null;
  const href = `/${locale}${isPerfume ? `/parfums/${product.id}` : `/boxes/${product.id}`}`;

  // Date.now() is technically impure during render, but a coarse ~14-day
  // ribbon window tolerates that fine — no visible effect from a few ms of
  // render-time skew, and there's no reactive "now" to plumb in from outside.
  // eslint-disable-next-line react-hooks/purity
  const isNew = !!product.createdAt && Date.now() - new Date(product.createdAt).getTime() < NEW_WINDOW_MS;

  // Priority order: out of stock beats everything (it's the most actionable
  // fact), then the catalog-type label, then "new" — never stack two ribbons.
  const ribbon =
    perfume && !perfume.inStock
      ? { label: t("outOfStockBadge"), tone: "muted" as const }
      : !isPerfume
        ? { label: t("boxBadge"), tone: "gold" as const }
        : isNew
          ? { label: t("newBadge"), tone: "gold" as const }
          : null;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name[locale]}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-300">
            <ShoppingBag size={40} />
          </div>
        )}

        {ribbon && <RibbonBadge label={ribbon.label} tone={ribbon.tone} />}
      </div>

      <div className="mt-4 flex flex-col items-center gap-1 px-1 text-center">
        <h3 className="font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
          {product.name[locale]}
        </h3>
        {product.price !== undefined && (
          <Price amount={product.price} className="text-sm font-medium text-accent" />
        )}
      </div>
    </Link>
  );
}
