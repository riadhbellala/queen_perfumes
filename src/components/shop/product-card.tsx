import React from "react";
import Link from "next/link";
import { Perfume, Pack } from "@/types";
import { Price } from "@/components/shop/price";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
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

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "gold" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm",
        tone === "gold"
          ? "bg-primary/90 text-primary-foreground shadow-sm"
          : "bg-foreground/75 text-background"
      )}
    >
      {label}
    </span>
  );
}

// Image-forward card used for both perfumes and boxes — one consistent card
// language across the whole catalog. Portrait 3:4, square corners/hairline
// chrome (matching the box-picker card's "perfume house" language — no
// radius, no heavy shadow, the photo leads), premium hover feedback. Works
// as a grid cell (/parfums, /boxes) and as a carousel slide (BoxesCarousel)
// unchanged.
export function ProductCard({ product, type }: ProductCardProps) {
  const locale = useLocale() as "fr" | "ar";
  const t = useTranslations("Product");
  const isPerfume = type === "perfume";
  const perfume = isPerfume ? (product as Perfume) : null;
  const href = `/${locale}${isPerfume ? `/parfums/${product.id}` : `/boxes/${product.id}`}`;

  // Date.now() is technically impure during render, but a coarse ~14-day
  // badge window tolerates that fine — no visible effect from a few ms of
  // render-time skew, and there's no reactive "now" to plumb in from outside.
  const isNew =
    !!product.createdAt &&
    // eslint-disable-next-line react-hooks/purity -- coarse 14-day window
    Date.now() - new Date(product.createdAt).getTime() < NEW_WINDOW_MS;

  // Priority order: out of stock beats everything (it's the most actionable
  // fact), then the catalog-type label, then "new" — never stack two badges.
  const badge =
    perfume && !perfume.inStock
      ? { label: t("outOfStockBadge"), tone: "muted" as const }
      : !isPerfume
        ? { label: t("boxBadge"), tone: "gold" as const }
        : isNew
          ? { label: t("newBadge"), tone: "gold" as const }
          : null;

  const viewLabel = isPerfume ? t("viewPerfume") : t("viewBox");

  return (
    <Link
      href={href}
      aria-label={`${product.name[locale]}${isPerfume && perfume ? ` — ${perfume.scentFamily}, ${perfume.concentration}` : ""}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article className="transition-transform duration-300 ease-out group-hover:-translate-y-1 group-active:translate-y-0 group-active:scale-[0.99]">
        <div
          className={cn(
            "relative aspect-[3/4] w-full overflow-hidden bg-muted ring-1 ring-border transition-[box-shadow,ring-color] duration-300",
            "group-hover:ring-primary/40 group-hover:shadow-[0_12px_40px_-12px_hsl(37_46%_38%_/_0.18)]",
            perfume && !perfume.inStock && "opacity-90"
          )}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt=""
              loading="lazy"
              aria-hidden
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
                perfume && !perfume.inStock && "grayscale-[0.35] saturate-75"
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
              <ShoppingBag size={40} strokeWidth={1.25} />
            </div>
          )}

          {/* Subtle bottom scrim — keeps hover cue legible on light photos */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/25 via-foreground/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* Status badge */}
          {badge && (
            <div className="absolute start-3 top-3 z-10">
              <StatusBadge label={badge.label} tone={badge.tone} />
            </div>
          )}

          {/* View cue — appears on hover */}
          <div
            aria-hidden
            className="absolute end-3 bottom-3 z-10 flex translate-y-1 items-center gap-1.5 bg-background/90 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-foreground opacity-0 shadow-sm ring-1 ring-border backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <span>{viewLabel}</span>
            <ArrowUpRight size={13} strokeWidth={2} className="text-accent" />
          </div>
        </div>

        <div className="mt-4 flex min-w-0 flex-col items-center gap-1.5 px-1 text-center text-balance">
          {isPerfume && perfume && (
            <p className="max-w-full truncate text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
              {perfume.scentFamily} · {perfume.concentration}
            </p>
          )}

          <h3 className="font-display text-lg font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary md:text-xl">
            {product.name[locale]}
          </h3>

          {product.price !== undefined && (
            <Price
              amount={product.price}
              className="text-base font-medium text-accent md:text-lg"
            />
          )}
        </div>
      </article>
    </Link>
  );
}
