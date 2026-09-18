"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Perfume, PackSizePricing } from "@/types";
import { useCart } from "@/context/CartContext";
import { toCartPerfumeSummary } from "@/lib/cart-line";
import { Price } from "@/components/shop/price";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, ShoppingBag, Info, PackageOpen, ChevronRight, X } from "lucide-react";

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
    return pricing.find(p => p.size === sizeToFind) || null;
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
    <div className="relative">
      {/* Selection tray — shows where a chosen perfume "lands" so it's obvious what's picked */}
      {selectedCount > 0 && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 md:p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-zinc-900">
              {locale === "fr" ? "Votre sélection" : "اختيارك"}
            </p>
            <p className="text-xs font-medium text-zinc-400">
              <bdi dir="ltr">{selectedCount}/6</bdi>
            </p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {selectedPerfumeIds.map((id) => {
              const perfume = perfumes.find((p) => p.id === id);
              if (!perfume) return null;
              return (
                <div key={id} className="relative shrink-0 w-16">
                  <button
                    type="button"
                    onClick={() => togglePerfume(id)}
                    aria-label={locale === "fr" ? "Retirer" : "إزالة"}
                    className="absolute -top-1.5 -end-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-white transition-transform hover:scale-110"
                  >
                    <X size={11} />
                  </button>
                  <div className="size-16 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                    {perfume.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={perfume.imageUrl}
                        alt={perfume.name[locale]}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <p className="mt-1 truncate text-center text-[10px] text-zinc-500">
                    {perfume.name[locale]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {perfumes.map((perfume) => {
          const isUnavailable = !perfume.inStock;
          const isSelected = selectedPerfumeIds.includes(perfume.id);
          const isMaxReached = selectedCount >= 6 && !isSelected;

          return (
            <div key={perfume.id} className="relative">
              <button
                onClick={() => !isUnavailable && togglePerfume(perfume.id)}
                disabled={isUnavailable || isMaxReached}
                className={`group relative w-full overflow-hidden rounded-2xl text-start transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-primary shadow-xl"
                    : isUnavailable || isMaxReached
                    ? "ring-1 ring-border opacity-40 cursor-not-allowed"
                    : "ring-1 ring-border hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/50 cursor-pointer"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  {perfume.imageUrl ? (
                    <img
                      src={perfume.imageUrl}
                      alt={perfume.name[locale]}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <ShoppingBag size={40} />
                    </div>
                  )}

                  {isSelected && <div className="absolute inset-0 bg-primary/10" />}

                  {/* Status: out-of-stock always wins over the selected badge —
                      the two states can't coexist in practice anyway (an
                      unavailable perfume can't be toggled on), but keeping an
                      explicit priority avoids ever stacking both. */}
                  {isUnavailable ? (
                    <span className="absolute start-3 top-3 z-10 rounded-full bg-red-950/85 px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                      {locale === "fr" ? "Rupture" : "نفد"}
                    </span>
                  ) : (
                    isSelected && (
                      <span className="absolute start-3 top-3 z-10 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )
                  )}
                </div>

                {/* Caption */}
                <div className="p-4">
                  <h3 className="font-display text-base font-semibold leading-tight text-foreground">
                    {perfume.name[locale]}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">
                    {perfume.scentFamily} · {perfume.concentration}
                  </p>
                </div>
              </button>

              {/* Info Dialog */}
              <Dialog>
                <DialogTrigger
                  render={
                    <button className="absolute end-3 top-3 z-10 rounded-full bg-white/80 p-2 text-zinc-600 shadow-sm ring-1 ring-black/5 backdrop-blur-md transition-all hover:bg-white hover:text-zinc-900 focus:outline-none" />
                  }
                >
                  <Info size={16} />
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-heading mb-2">{perfume.name[locale]}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    {perfume.imageUrl && (
                      <img
                        src={perfume.imageUrl}
                        alt={perfume.name[locale]}
                        className="w-full h-72 object-cover rounded-2xl mb-6 shadow-sm"
                      />
                    )}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="bg-muted text-zinc-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
                        {perfume.scentFamily}
                      </span>
                      <span className="bg-muted text-zinc-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
                        {perfume.concentration}
                      </span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed text-base">
                      {perfume.description[locale]}
                    </p>
                  </div>
                  <div className="mt-8 flex justify-end gap-3">
                    <Button
                      onClick={() => {
                        if (!isUnavailable && (!isMaxReached || isSelected)) {
                          togglePerfume(perfume.id);
                        }
                      }}
                      disabled={isUnavailable || (isMaxReached && !isSelected)}
                      size="lg"
                      className={`w-full h-14 text-lg rounded-full font-semibold transition-all ${
                        isSelected 
                          ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700" 
                          : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-2xl"
                      }`}
                    >
                      {isSelected 
                        ? (locale === "fr" ? "Retirer de la box" : "أزل من المجموعة")
                        : (locale === "fr" ? "Ajouter à la box" : "أضف إلى المجموعة")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Widget */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl">

            <div className="flex items-center gap-4 ps-6 py-2">
              <div className="bg-white/10 p-2 rounded-full">
                <PackageOpen size={24} className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg leading-tight">
                  <bdi dir="ltr">{selectedCount}</bdi>{" "}
                  {locale === "fr" ? (selectedCount > 1 ? "Parfums sélectionnés" : "Parfum sélectionné") : "عطور محددة"}
                </p>
                {currentPricing ? (
                  <Price amount={currentPricing.price} className="text-sm text-primary-foreground/70 font-medium" />
                ) : (
                  <p className="text-sm text-primary-foreground/70 font-medium">
                    {locale === "fr" ? "Ajoutez-en 1 autre pour une box" : "أضف 1 آخر لتكوين مجموعة"}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={selectedCount < 2}
              size="lg"
              className={`h-14 px-8 rounded-full font-bold text-base transition-all duration-300 flex items-center gap-2 ${
                selectedCount >= 2
                  ? "bg-white text-zinc-900 hover:bg-zinc-100 hover:scale-105"
                  : "bg-white/10 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {locale === "fr" ? "Commander" : "إتمام الطلب"}
              {selectedCount >= 2 && <ChevronRight size={18} className={locale === 'ar' ? 'rotate-180' : ''} />}
            </Button>
            
          </div>
        </div>
      )}
    </div>
  );
}
