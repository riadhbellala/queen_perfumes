"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Price } from "@/components/shop/price";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { useLocale } from "next-intl";
import type { Pack } from "@/types";

export function BoxesBrowser({
  packs,
  startingPrice,
}: {
  packs: Pack[];
  /** Lowest pack_size_pricing.price, for the CTA banner's "starting at" line
      — null if pricing couldn't be loaded, in which case that line is
      dropped rather than showing a stale or fabricated number. */
  startingPrice: number | null;
}) {
  const locale = useLocale() as "fr" | "ar";
  const [sortBy, setSortBy] = useState<string>("featured");

  const sorted = useMemo(() => {
    const result = [...packs];
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [packs, sortBy]);

  return (
    <>
      {/* ── Sort bar ── */}
      <div className="border-b border-border bg-background sticky top-20 z-20">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 font-medium hidden md:block">
            <bdi dir="ltr">{sorted.length}</bdi> {locale === "fr" ? "boxes" : "مجموعات"}
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: "featured", label: locale === "fr" ? "Vedettes" : "المميزة" },
              { key: "price-asc", label: locale === "fr" ? "Prix ↑" : "السعر ↑" },
              { key: "price-desc", label: locale === "fr" ? "Prix ↓" : "السعر ↓" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 active:scale-95 ${
                  sortBy === key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-zinc-600 hover:bg-muted/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pack Grid — same ProductCard as /parfums and the homepage
          carousel, so the whole catalog reads as one card language ── */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-16">
        <div className="stagger-fade grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
          {sorted.map((pack) => (
            <ProductCard key={pack.id} product={pack} type="pack" />
          ))}
        </div>

        {/* ── CTA Banner — real product photo, dark overlay for legible white text ── */}
        <div className="relative mt-20 overflow-hidden rounded-3xl bg-[url('/assets/create-box.webp')] bg-cover bg-center p-10 text-center md:p-16">
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
              {locale === "fr" ? "Vous ne trouvez pas votre bonheur ?" : "لا تجدين ما تريدين؟"}
            </h2>
            <p className="text-white/85 max-w-lg mx-auto mb-8 text-base">
              {locale === "fr" ? (
                <>
                  Composez votre propre box sur mesure. De 2 à 6 parfums
                  {startingPrice !== null && (
                    <>
                      , à partir de <Price amount={startingPrice} className="font-semibold text-white" />
                    </>
                  )}
                  .
                </>
              ) : (
                <>
                  أنشئي مجموعتك المخصصة. من 2 إلى 6 عطور
                  {startingPrice !== null && (
                    <>
                      ، بدءاً من <Price amount={startingPrice} className="font-semibold text-white" />
                    </>
                  )}
                  .
                </>
              )}
            </p>
            <Link href={`/${locale}/creez-votre-box`}>
              <Button
                size="lg"
                className="h-14 px-10 text-base font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:scale-105 transition-all duration-300"
              >
                {locale === "fr" ? "Créez votre box" : "أنشئي مجموعتك"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
