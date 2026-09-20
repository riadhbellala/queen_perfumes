"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Perfume, PackSizePricing } from "@/types";
import { useCart } from "@/context/CartContext";
import { toCartPerfumeSummary } from "@/lib/cart-line";
import { Price } from "@/components/shop/price";
import { Button } from "@/components/ui/button";
import { PerfumePickerCard } from "@/components/shop/box-picker-card";

const HOW_STEPS = [1, 2, 3] as const;

export function HomepageBoxBuilder({
  perfumes,
  pricing,
}: {
  perfumes: Perfume[];
  pricing: PackSizePricing[];
}) {
  const locale = useLocale() as "fr" | "ar";
  const router = useRouter();
  const t = useTranslations("PackBuilder");
  const { addItem } = useCart();

  const [selectedPerfumeIds, setSelectedPerfumeIds] = useState<string[]>([]);
  const selectedCount = selectedPerfumeIds.length;

  // Calculate price based on selected count
  const currentPricing = useMemo(() => {
    if (selectedCount < 2) return null;
    // Cap size at 6 (max pack size)
    const sizeToFind = Math.min(selectedCount, 6);
    return pricing.find((p) => p.size === sizeToFind) || null;
  }, [selectedCount, pricing]);

  function togglePerfume(id: string) {
    setSelectedPerfumeIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 6) return prev; // Max 6 perfumes per pack
      return [...prev, id];
    });
  }

  function handleCheckout() {
    if (selectedCount < 2 || !currentPricing) return;

    addItem({
      type: "custom_pack",
      size: currentPricing.size,
      selectedPerfumeIds,
      perfumes: selectedPerfumeIds
        .map((id) => perfumes.find((p) => p.id === id))
        .filter((p): p is Perfume => Boolean(p))
        .map(toCartPerfumeSummary),
      price: currentPricing.price,
      quantity: 1,
    });

    router.push(`/${locale}/commande`);
  }

  return (
    <div className="flex flex-col gap-11 bg-secondary px-6 py-[72px] pb-16 lg:flex-row lg:gap-20 lg:px-20 lg:py-[120px]">
      {/* ── Left column ── */}
      <div className="lg:w-[400px] lg:shrink-0">
        <p className="text-[11px] uppercase tracking-[0.2em] text-accent lg:text-xs">{t("eyebrow")}</p>
        <h2 className="mt-3 text-balance font-display text-[42px] font-light leading-[1.05] text-foreground lg:text-[56px]">
          {t("title")}
        </h2>
        <p className="mt-5 text-balance text-base text-muted-foreground">{t("subtitle")}</p>

        {/* Three steps — hidden below md, too heavy for mobile */}
        <div className="mt-10 hidden divide-y divide-border border-t border-border md:block">
          {HOW_STEPS.map((step) => (
            <div key={step} className="flex gap-4 py-5">
              <bdi dir="ltr" className="shrink-0 font-sans text-[26px] font-semibold text-accent">
                {String(step).padStart(2, "0")}
              </bdi>
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-foreground">
                  {t(`howStep${step}Title` as "howStep1Title")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`howStep${step}Desc` as "howStep1Desc")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-10">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">{t("pricingTitle")}</h3>

          {/* Desktop / tablet: list with hairlines */}
          <div className="mt-4 hidden divide-y divide-border border-t border-border md:block">
            {pricing.map(({ size, price }) => {
              const isCurrent = currentPricing?.size === size;
              return (
                <div key={size} className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2.5 text-sm text-foreground">
                    <span
                      className={`size-1.5 shrink-0 ${isCurrent ? "bg-accent" : "bg-transparent"}`}
                      aria-hidden
                    />
                    {t("pricingRowLabel", { count: size })}
                  </span>
                  <Price amount={price} className="text-sm font-medium text-foreground" />
                </div>
              );
            })}
          </div>

          {/* Mobile: 5-column grid */}
          <div className="mt-4 grid grid-cols-5 gap-2 md:hidden">
            {pricing.map(({ size, price }) => {
              const isCurrent = currentPricing?.size === size;
              return (
                <div key={size} className="flex flex-col items-center gap-1.5 text-center">
                  <span className={`size-1.5 ${isCurrent ? "bg-accent" : "bg-transparent"}`} aria-hidden />
                  <bdi dir="ltr" className="font-sans text-2xl font-semibold text-foreground">
                    {size}
                  </bdi>
                  <Price amount={price} className="text-xs text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right column ── */}
      <div className="min-w-0 flex-1 xl:w-[800px] xl:flex-none">
        <div className="grid grid-cols-2 gap-x-[14px] gap-y-9 md:grid-cols-3 md:gap-x-5 md:gap-y-11">
          {perfumes.map((perfume) => {
            const isSelected = selectedPerfumeIds.includes(perfume.id);
            const isMaxReached = selectedCount >= 6 && !isSelected;
            return (
              <PerfumePickerCard
                key={perfume.id}
                perfume={perfume}
                locale={locale}
                selected={isSelected}
                disabled={isMaxReached}
                onToggle={() => togglePerfume(perfume.id)}
                addLabel={t("addStatus")}
                selectedLabel={t("selectedStatus")}
                outOfStockLabel={t("outOfStock")}
              />
            );
          })}
        </div>

        {/* Summary bar */}
        <div className="mt-12 flex flex-col gap-5 border border-border bg-background px-5 py-6 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8 md:py-[26px]">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-balance font-display text-2xl text-foreground lg:text-[26px]">
                {t("selectedCountLabel", { count: selectedCount })}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">{t("maxPerBoxLabel")}</p>
            </div>
            {currentPricing && (
              <div className="shrink-0 md:hidden">
                <Price amount={currentPricing.price} className="text-2xl font-medium text-foreground" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            {currentPricing && (
              <div className="hidden shrink-0 md:block">
                <Price amount={currentPricing.price} className="text-[34px] font-medium text-foreground" />
              </div>
            )}
            <Button
              onClick={handleCheckout}
              disabled={selectedCount < 2}
              className="h-14 w-full rounded-none bg-primary px-9 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary/90 md:h-[54px] md:w-auto"
            >
              {locale === "fr" ? "Commander" : "إتمام الطلب"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
