"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PLACEHOLDER_PACKS } from "@/lib/placeholder-data";
import { Price } from "@/components/shop/price";
import { Button } from "@/components/ui/button";
import { PackageOpen, ArrowRight, Sparkles } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export default function BoxesPage() {
  const t = useTranslations("Packs");
  const locale = useLocale() as "fr" | "ar";
  const [sortBy, setSortBy] = useState<string>("featured");

  const sorted = useMemo(() => {
    const result = [...PLACEHOLDER_PACKS];
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [sortBy]);

  const sizeLabel = (count: number) =>
    locale === "fr" ? `${count} parfums` : `${count} عطور`;

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-zinc-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-8 py-20 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <PackageOpen size={14} />
            {locale === "fr" ? "Collections exclusives" : "مجموعات حصرية"}
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-medium tracking-tight mb-5">
            {t("title")}
          </h1>
          <p className="text-zinc-300 max-w-xl mx-auto text-lg mb-10">
            {locale === "fr"
              ? "Nos boxes ont été soigneusement composées pour vous offrir une expérience parfumée inoubliable."
              : "تم تصميم مجموعاتنا بعناية لتقديم تجربة عطرية لا تُنسى."}
          </p>
          <Link href={`/${locale}/creez-votre-box`}>
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold rounded-full bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
            >
              <Sparkles size={18} />
              {locale === "fr" ? "Créez le vôtre" : "أنشئ مجموعتك"}
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Sort bar ── */}
      <div className="border-b border-zinc-100 bg-white sticky top-20 z-20">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 font-medium hidden md:block">
            {sorted.length} {locale === "fr" ? "boxes" : "مجموعات"}
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
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map((pack) => (
            <Link
              key={pack.id}
              href={`/${locale}/boxes/${pack.id}`}
              className="group flex flex-col rounded-3xl overflow-hidden bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-[4/3] bg-zinc-50">
                {pack.imageUrl ? (
                  <img
                    src={pack.imageUrl}
                    alt={pack.name[locale]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PackageOpen size={48} className="text-zinc-300" />
                  </div>
                )}
                {/* Price badge */}
                <div className="absolute top-4 end-4 bg-white/90 backdrop-blur-sm text-zinc-900 font-bold text-sm px-4 py-1.5 rounded-full shadow-md">
                  <Price amount={pack.price} />
                </div>
                {/* Perfume count badge */}
                <div className="absolute bottom-4 start-4 bg-zinc-900/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Sparkles size={11} />
                  {sizeLabel(pack.perfumeIds.length)}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                <h2 className="text-xl font-heading font-semibold text-zinc-900 mb-3 group-hover:text-zinc-700 transition-colors">
                  {pack.name[locale]}
                </h2>
                <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 flex-1">
                  {pack.description[locale]}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <Price amount={pack.price} className="text-2xl font-bold text-zinc-900" />
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 group-hover:text-zinc-900 transition-colors">
                    {locale === "fr" ? "Voir la box" : "عرض المجموعة"}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── CTA Banner ── */}
        <div className="mt-20 bg-zinc-50 border border-zinc-100 rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-medium text-zinc-900 mb-4">
            {locale === "fr" ? "Vous ne trouvez pas votre bonheur ?" : "لا تجدين ما تريدين؟"}
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto mb-8 text-base">
            {locale === "fr"
              ? "Composez votre propre box sur mesure. De 2 à 6 parfums, à partir de 1 900 DA."
              : "أنشئي مجموعتك المخصصة. من 2 إلى 6 عطور، بدءاً من 1 900 دج."}
          </p>
          <Link href={`/${locale}/creez-votre-box`}>
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold rounded-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
            >
              <Sparkles size={18} />
              {locale === "fr" ? "Créez votre box" : "أنشئي مجموعتك"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
