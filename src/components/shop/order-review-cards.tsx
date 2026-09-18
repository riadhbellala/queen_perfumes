"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { CartItem, CartPerfumeSummary } from "@/types";
import { lineImage, lineUnitPrice } from "@/lib/cart-line";
import { Price } from "@/components/shop/price";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

type Locale = "fr" | "ar";

function LineThumbnail({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-zinc-400">
          <ShoppingBag size={16} />
        </div>
      )}
    </div>
  );
}

// A single perfume, shown like a product card — a big photo, name, badges,
// full description — always visible, nothing to click or expand.
function PerfumeCard({ perfume, locale }: { perfume: CartPerfumeSummary; locale: Locale }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row rounded-2xl border border-border bg-card p-4">
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-40 md:w-44">
        {perfume.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={perfume.imageUrl}
            alt={perfume.name[locale]}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <ShoppingBag size={28} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-lg font-medium text-zinc-900">{perfume.name[locale]}</p>
        <div className="my-2 flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-normal">
            {perfume.scentFamily}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {perfume.concentration}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-zinc-500">{perfume.description[locale]}</p>
      </div>
    </div>
  );
}

function PerfumeCardList({ perfumes, locale }: { perfumes: CartPerfumeSummary[]; locale: Locale }) {
  return (
    <div className="flex flex-col gap-3">
      {perfumes.map((perfume, index) => (
        <PerfumeCard key={`${perfume.id}-${index}`} perfume={perfume} locale={locale} />
      ))}
    </div>
  );
}

export function OrderReviewCards({ items }: { items: CartItem[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      {items.map((item) => {
        const unit = lineUnitPrice(item);
        const linePrice = unit * item.quantity;
        const title =
          item.type === "custom_pack" ? t("PackBuilder.customPackLabel", { count: item.size }) : item.name[locale];

        return (
          <div key={item.cartLineId}>
            {/* Line summary */}
            <div className="flex items-center gap-4 pb-4">
              <LineThumbnail src={lineImage(item)} alt={title} />
              <div className="min-w-0 flex-1 text-start">
                <p className="truncate font-medium text-zinc-900">{title}</p>
                <p className="text-xs text-zinc-500">
                  {t("Checkout.quantityShort")} × <bdi dir="ltr">{item.quantity}</bdi>
                </p>
              </div>
              <Price amount={linePrice} className="shrink-0 font-semibold text-zinc-900" />
            </div>

            {/* Perfumes in this line — always visible, straight from the
                snapshot captured when the item was added to the cart */}
            {item.type === "perfume" && item.perfume && (
              <PerfumeCard perfume={item.perfume} locale={locale} />
            )}

            {item.type === "pack" && !!item.perfumes?.length && (
              <PerfumeCardList perfumes={item.perfumes} locale={locale} />
            )}

            {item.type === "custom_pack" && !!item.perfumes?.length && (
              <PerfumeCardList perfumes={item.perfumes} locale={locale} />
            )}
          </div>
        );
      })}
    </div>
  );
}
