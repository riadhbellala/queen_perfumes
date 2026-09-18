"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Price } from "@/components/shop/price";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import type { Pack } from "@/types";

export function BoxesBrowser({
  packs,
  perfumeImages,
  startingPrice,
}: {
  packs: Pack[];
  perfumeImages: Record<string, string | undefined>;
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
      <div className="border-b border-zinc-100 bg-white sticky top-20 z-20">
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
                    ? "bg-zinc-900 text-white shadow-md"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pack Grid ── */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-16">
        <div className="stagger-fade grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map((pack) => {
            const thumbnails = pack.perfumeIds
              .map((id) => perfumeImages[id])
              .filter((url): url is string => Boolean(url));

            return (
              <Link
                key={pack.id}
                href={`/${locale}/boxes/${pack.id}`}
                className="group flex flex-col rounded-3xl overflow-hidden bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 active:scale-[0.99]"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/3] bg-zinc-50">
                  {pack.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pack.imageUrl}
                      alt={pack.name[locale]}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-50" />
                  )}
                  {/* Price badge */}
                  <div className="absolute top-4 end-4 bg-white/90 backdrop-blur-sm text-zinc-900 font-bold text-sm px-4 py-1.5 rounded-full shadow-md">
                    <Price amount={pack.price} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6">
                  <h2 className="text-xl font-heading font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                    {pack.name[locale]}
                  </h2>

                  {thumbnails.length > 0 && (
                    <div className="flex items-center mb-3 [&>*:not(:first-child)]:-ms-2">
                      {thumbnails.slice(0, 4).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="size-7 rounded-full object-cover ring-2 ring-white"
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 flex-1">
                    {pack.description[locale]}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <Price amount={pack.price} className="text-2xl font-bold text-zinc-900" />
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      {locale === "fr" ? "Voir la box" : "عرض المجموعة"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── CTA Banner ── */}
        <div className="mt-20 bg-zinc-50 border border-zinc-100 rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-medium text-zinc-900 mb-4">
            {locale === "fr" ? "Vous ne trouvez pas votre bonheur ?" : "لا تجدين ما تريدين؟"}
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto mb-8 text-base">
            {locale === "fr" ? (
              <>
                Composez votre propre box sur mesure. De 2 à 6 parfums
                {startingPrice !== null && (
                  <>
                    , à partir de <Price amount={startingPrice} className="font-semibold text-zinc-700" />
                  </>
                )}
                .
              </>
            ) : (
              <>
                أنشئي مجموعتك المخصصة. من 2 إلى 6 عطور
                {startingPrice !== null && (
                  <>
                    ، بدءاً من <Price amount={startingPrice} className="font-semibold text-zinc-700" />
                  </>
                )}
                .
              </>
            )}
          </p>
          <Link href={`/${locale}/creez-votre-box`}>
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold rounded-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl hover:scale-105 transition-all duration-300"
            >
              {locale === "fr" ? "Créez votre box" : "أنشئي مجموعتك"}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
