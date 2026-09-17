"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { PLACEHOLDER_PERFUMES, PACK_SIZE_PRICING } from "@/lib/placeholder-data";
import { Perfume } from "@/types";
import { useCart } from "@/context/CartContext";
import { Price } from "@/components/shop/price";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, ShoppingBag, Info, PackageOpen, ChevronRight, X } from "lucide-react";

export function HomepagePackBuilder() {
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
    return PACK_SIZE_PRICING.find(p => p.size === sizeToFind) || null;
  }, [selectedCount]);

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
      price: currentPricing.price,
      quantity: 1,
    });

    router.push(`/${locale}/commande`);
  }

  return (
    <div className="relative">
      {/* Selection tray — shows where a chosen perfume "lands" so it's obvious what's picked */}
      {selectedCount > 0 && (
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 md:p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-zinc-900">
              {locale === "fr" ? "Votre sélection" : "اختيارك"}
            </p>
            <p className="text-xs font-medium text-zinc-400">{selectedCount}/6</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {selectedPerfumeIds.map((id) => {
              const perfume = PLACEHOLDER_PERFUMES.find((p) => p.id === id);
              if (!perfume) return null;
              return (
                <div key={id} className="relative shrink-0 w-16">
                  <button
                    type="button"
                    onClick={() => togglePerfume(id)}
                    aria-label={locale === "fr" ? "Retirer" : "إزالة"}
                    className="absolute -top-1.5 -end-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-zinc-900 text-white shadow ring-2 ring-white transition-transform hover:scale-110"
                  >
                    <X size={11} />
                  </button>
                  <div className="size-16 overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-200">
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
        {PLACEHOLDER_PERFUMES.map((perfume) => {
          const isUnavailable = !perfume.inStock;
          const isSelected = selectedPerfumeIds.includes(perfume.id);
          const isMaxReached = selectedCount >= 6 && !isSelected;

          return (
            <div key={perfume.id} className="relative">
              <button
                onClick={() => !isUnavailable && togglePerfume(perfume.id)}
                disabled={isUnavailable || isMaxReached}
                className={`relative rounded-2xl border-2 overflow-hidden text-start w-full transition-all duration-300 group ${
                  isSelected
                    ? "border-zinc-900 shadow-xl ring-2 ring-zinc-900 ring-offset-4 scale-[1.02]"
                    : isUnavailable || isMaxReached
                    ? "border-zinc-100 opacity-40 cursor-not-allowed"
                    : "border-zinc-100 hover:border-zinc-300 hover:shadow-lg cursor-pointer hover:-translate-y-1"
                }`}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-zinc-50 relative">
                  {perfume.imageUrl ? (
                    <img
                      src={perfume.imageUrl}
                      alt={perfume.name[locale]}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <ShoppingBag size={40} />
                    </div>
                  )}

                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center backdrop-blur-[2px] transition-all">
                      <div className="bg-white text-zinc-900 p-3 rounded-full shadow-2xl scale-in-center">
                        <CheckCircle2 className="w-8 h-8" strokeWidth={3} />
                      </div>
                    </div>
                  )}

                  {isUnavailable && (
                    <div className="absolute top-3 start-3 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {locale === "fr" ? "Rupture" : "نفد"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 bg-white">
                  <h3 className="font-heading font-semibold text-zinc-900 text-lg leading-tight mb-1">{perfume.name[locale]}</h3>
                  <p className="text-sm text-zinc-500 font-medium">{perfume.scentFamily} · {perfume.concentration}</p>
                </div>
              </button>

              {/* Info Dialog */}
              <Dialog>
                <DialogTrigger
                  render={
                    <button className="absolute top-3 end-3 bg-white/90 hover:bg-white text-zinc-600 hover:text-zinc-900 p-2 rounded-full shadow-md backdrop-blur-md transition-all hover:scale-110 focus:outline-none z-10" />
                  }
                >
                  <Info size={18} />
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
                      <span className="bg-zinc-100 text-zinc-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
                        {perfume.scentFamily}
                      </span>
                      <span className="bg-zinc-100 text-zinc-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
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
                          : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl hover:shadow-2xl"
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
          <div className="bg-zinc-900 text-white p-2 rounded-full shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
            
            <div className="flex items-center gap-4 ps-6 py-2">
              <div className="bg-white/10 p-2 rounded-full">
                <PackageOpen size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-lg leading-tight">
                  <bdi dir="ltr">{selectedCount}</bdi>{" "}
                  {locale === "fr" ? (selectedCount > 1 ? "Parfums sélectionnés" : "Parfum sélectionné") : "عطور محددة"}
                </p>
                {currentPricing ? (
                  <Price amount={currentPricing.price} className="text-sm text-zinc-400 font-medium" />
                ) : (
                  <p className="text-sm text-zinc-400 font-medium">
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
