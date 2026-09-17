"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { CartItem } from "@/types";
import { PLACEHOLDER_PERFUMES, PLACEHOLDER_PACKS } from "@/lib/placeholder-data";
import { lineImage, lineUnitPrice } from "@/lib/cart-line";
import { Price } from "@/components/shop/price";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ShoppingBag } from "lucide-react";

type Locale = "fr" | "ar";

function LineThumbnail({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <ShoppingBag size={20} />
        </div>
      )}
    </div>
  );
}

function PerfumeDetail({
  perfume,
  locale,
}: {
  perfume: (typeof PLACEHOLDER_PERFUMES)[number] | undefined;
  locale: Locale;
}) {
  if (!perfume) return null;
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-28">
        {perfume.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={perfume.imageUrl}
            alt={perfume.name[locale]}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag size={24} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading font-medium text-foreground">{perfume.name[locale]}</p>
        <div className="my-2 flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-normal">
            {perfume.scentFamily}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {perfume.concentration}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {perfume.description[locale]}
        </p>
      </div>
    </div>
  );
}

function PerfumeDetailList({ perfumeIds, locale }: { perfumeIds: string[]; locale: Locale }) {
  return (
    <div className="flex flex-col gap-5">
      {perfumeIds.map((id, index) => {
        const perfume = PLACEHOLDER_PERFUMES.find((p) => p.id === id);
        if (!perfume) return null;
        return (
          <React.Fragment key={`${id}-${index}`}>
            {index > 0 && <Separator />}
            <PerfumeDetail perfume={perfume} locale={locale} />
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function OrderReviewAccordion({ items }: { items: CartItem[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return (
    <Accordion defaultValue={items[0] ? [items[0].cartLineId] : []} className="w-full">
      {items.map((item) => {
        const unit = lineUnitPrice(item);
        const linePrice = unit * item.quantity;
        const title =
          item.type === "custom_pack"
            ? t("PackBuilder.customPackLabel", { count: item.size })
            : item.name[locale];

        return (
          <AccordionItem key={item.cartLineId} value={item.cartLineId}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center gap-4 pe-2">
                <LineThumbnail src={lineImage(item)} alt={title} />
                <div className="min-w-0 flex-1 text-start">
                  <p className="truncate font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("Checkout.quantityShort")} × {item.quantity}
                  </p>
                </div>
                <Price amount={linePrice} className="shrink-0 font-semibold text-foreground" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {item.type === "perfume" &&
                (() => {
                  const perfume = PLACEHOLDER_PERFUMES.find((p) => p.id === item.perfumeId);
                  return <PerfumeDetail perfume={perfume} locale={locale} />;
                })()}

              {item.type === "pack" &&
                (() => {
                  const pack = PLACEHOLDER_PACKS.find((p) => p.id === item.packId);
                  return (
                    <div className="flex flex-col gap-5">
                      {pack && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {pack.description[locale]}
                        </p>
                      )}
                      <p className="text-sm font-medium text-foreground">{t("Pack.contains")}</p>
                      <PerfumeDetailList perfumeIds={item.perfumeIds} locale={locale} />
                    </div>
                  );
                })()}

              {item.type === "custom_pack" && (
                <div className="flex flex-col gap-5">
                  <p className="text-sm font-medium text-foreground">{t("Pack.contains")}</p>
                  <PerfumeDetailList perfumeIds={item.selectedPerfumeIds} locale={locale} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
