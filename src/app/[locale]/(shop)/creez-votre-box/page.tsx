"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
import { CheckCircle2, ShoppingBag, Info, ChevronLeft, ChevronRight, X } from "lucide-react";

// ─── Step progress ───────────────────────────────────────────────────────────
function StepDot({
  index,
  label,
  active,
  done,
}: {
  index: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
          done || active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
        }`}
      >
        {done ? <CheckCircle2 size={14} /> : index}
      </div>
      <span className={`text-sm font-medium ${active ? "text-zinc-900" : "text-zinc-400"}`}>{label}</span>
    </div>
  );
}

function StepProgress({ step, labels }: { step: 1 | 2; labels: [string, string] }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      <StepDot index={1} label={labels[0]} active={step === 1} done={step > 1} />
      <div className={`h-px w-10 transition-colors ${step > 1 ? "bg-zinc-900" : "bg-zinc-200"}`} />
      <StepDot index={2} label={labels[1]} active={step === 2} done={false} />
    </div>
  );
}

// ─── Step 1: Size selector card ─────────────────────────────────────────────
function SizeCard({
  size,
  price,
  selected,
  onClick,
  perfumesLabel,
  bestValue,
  bestValueLabel,
}: {
  size: number;
  price: number;
  selected: boolean;
  onClick: () => void;
  perfumesLabel: string;
  bestValue: boolean;
  bestValueLabel: string;
}) {
  const perUnit = Math.round(price / size);
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl border-2 p-6 text-center transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
        selected
          ? "border-zinc-900 bg-zinc-900 text-white shadow-xl scale-[1.03]"
          : "border-zinc-100 bg-white text-zinc-900 hover:border-zinc-300 hover:shadow-md"
      }`}
    >
      {bestValue && (
        <span
          className={`absolute -top-3 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase shadow-md ${
            selected ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"
          }`}
        >
          {bestValueLabel}
        </span>
      )}
      <div className={`text-4xl font-sans font-bold mb-1 ${selected ? "text-white" : "text-zinc-900"}`}>
        <bdi dir="ltr">{size}</bdi>
      </div>
      <div className={`text-sm font-medium mb-3 ${selected ? "text-zinc-300" : "text-zinc-400"}`}>{perfumesLabel}</div>
      <Price amount={price} className={`text-xl font-semibold ${selected ? "text-white" : "text-zinc-900"}`} />
      <div className={`text-xs mt-1 ${selected ? "text-zinc-400" : "text-zinc-400"}`}>
        ≈ <Price amount={perUnit} className="text-xs" /> / u.
      </div>
      {selected && (
        <div className="absolute top-3 end-3">
          <CheckCircle2 size={18} className="text-white" />
        </div>
      )}
    </button>
  );
}

// ─── Step 2: Perfume picker card ─────────────────────────────────────────────
function PerfumePickerCard({
  perfume,
  locale,
  selected,
  disabled,
  onToggle,
  selectedLabel,
  outOfStockLabel,
}: {
  perfume: Perfume;
  locale: "fr" | "ar";
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  selectedLabel: string;
  outOfStockLabel: string;
}) {
  const isUnavailable = !perfume.inStock;
  const isDisabledNotSelected = disabled && !selected;

  return (
    <div className="relative">
      <button
        onClick={() => !isUnavailable && onToggle()}
        disabled={isDisabledNotSelected || isUnavailable}
        className={`relative rounded-xl border-2 overflow-hidden text-start w-full transition-all duration-200 group ${
          selected
            ? "border-zinc-900 shadow-lg ring-2 ring-zinc-900 ring-offset-2"
            : isDisabledNotSelected || isUnavailable
            ? "border-zinc-100 opacity-40 cursor-not-allowed"
            : "border-zinc-100 hover:border-zinc-300 hover:shadow-md cursor-pointer"
        }`}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-zinc-50 relative">
          {perfume.imageUrl ? (
            <img
              src={perfume.imageUrl}
              alt={perfume.name[locale]}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <ShoppingBag size={40} />
            </div>
          )}

          {/* Selected overlay */}
          {selected && (
            <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
          )}

          {/* Badges */}
          {selected && (
            <div className="absolute top-2 start-2 bg-zinc-900 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {selectedLabel}
            </div>
          )}
          {isUnavailable && (
            <div className="absolute top-2 start-2 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
              {outOfStockLabel}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="font-medium text-zinc-900 text-sm leading-tight">{perfume.name[locale]}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{perfume.scentFamily} · {perfume.concentration}</p>
        </div>
      </button>

      {/* Info Dialog */}
      <Dialog>
        <DialogTrigger
          render={
            <button className="absolute top-2 end-2 bg-white/80 hover:bg-white text-zinc-600 p-1.5 rounded-full shadow-sm backdrop-blur-sm transition-all hover:scale-110 focus:outline-none z-10" />
          }
        >
          <Info size={18} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading mb-2">{perfume.name[locale]}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {perfume.imageUrl && (
              <img
                src={perfume.imageUrl}
                alt={perfume.name[locale]}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
            )}
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                {perfume.scentFamily}
              </span>
              <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                {perfume.concentration}
              </span>
            </div>
            <p className="text-zinc-600 leading-relaxed text-sm">
              {perfume.description[locale]}
            </p>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => {
                if (!isUnavailable && (!isDisabledNotSelected || selected)) {
                  onToggle();
                }
              }}
              disabled={isUnavailable || (isDisabledNotSelected && !selected)}
              size="lg"
              className={`w-full h-12 rounded-full font-semibold ${selected ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}
            >
              {selected
                ? (locale === "fr" ? "Retirer de la box" : "أزل من المجموعة")
                : (locale === "fr" ? "Ajouter à la box" : "أضف إلى المجموعة")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function CreezVotreBoxPage() {
  const t = useTranslations("PackBuilder");
  const locale = useLocale() as "fr" | "ar";
  const router = useRouter();
  const { addItem } = useCart();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSize, setSelectedSize] = useState<2 | 3 | 4 | 5 | 6 | null>(null);
  const [selectedPerfumeIds, setSelectedPerfumeIds] = useState<string[]>([]);

  const selectedSizePricing = useMemo(
    () => PACK_SIZE_PRICING.find((p) => p.size === selectedSize) ?? null,
    [selectedSize]
  );

  const bestValueSize = useMemo(
    () =>
      PACK_SIZE_PRICING.reduce((best, cur) => (cur.price / cur.size < best.price / best.size ? cur : best)).size,
    []
  );

  const selectedPerfumes = useMemo(
    () => selectedPerfumeIds.map((id) => PLACEHOLDER_PERFUMES.find((p) => p.id === id)).filter(Boolean),
    [selectedPerfumeIds]
  );

  const remaining = selectedSize ? selectedSize - selectedPerfumeIds.length : 0;
  const isComplete = selectedSize !== null && remaining === 0;

  function handleSizeSelect(size: 2 | 3 | 4 | 5 | 6) {
    setSelectedSize(size);
    setSelectedPerfumeIds([]);
    setStep(2);
  }

  function togglePerfume(id: string) {
    setSelectedPerfumeIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (selectedSize && prev.length >= selectedSize) return prev;
      return [...prev, id];
    });
  }

  function handleCheckout() {
    if (!isComplete || !selectedSizePricing) return;
    addItem({
      type: "custom_pack",
      size: selectedSizePricing.size,
      selectedPerfumeIds,
      price: selectedSizePricing.price,
      quantity: 1,
    });
    router.push(`/${locale}/commande`);
  }

  function handleChangeSize() {
    setStep(1);
    setSelectedSize(null);
    setSelectedPerfumeIds([]);
  }

  return (
    <div className="bg-zinc-50/50 min-h-screen pb-36">
      {/* Hero Header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-14 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-zinc-900 mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">{t("subtitle")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-12">

        <StepProgress
          step={step}
          labels={[
            locale === "fr" ? "Taille" : "الحجم",
            locale === "fr" ? "Parfums" : "العطور",
          ]}
        />

        {/* ── Step 1: Size selection ── */}
        <div className={step === 2 ? "mb-8" : ""}>
          {step === 1 && (
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-2xl font-heading font-semibold text-zinc-900 mb-8 text-center">
                {t("step1Title")}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
                {PACK_SIZE_PRICING.map(({ size, price }) => (
                  <SizeCard
                    key={size}
                    size={size}
                    price={price}
                    selected={selectedSize === size}
                    perfumesLabel={locale === "fr" ? "parfums" : "عطور"}
                    bestValue={size === bestValueSize}
                    bestValueLabel={locale === "fr" ? "Meilleure offre" : "أفضل قيمة"}
                    onClick={() => handleSizeSelect(size as 2 | 3 | 4 | 5 | 6)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedSizePricing && (
            <div className="flex items-center justify-between mb-8 bg-white rounded-2xl px-6 py-4 border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={handleChangeSize}
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ChevronLeft size={16} className={locale === "ar" ? "rotate-180" : ""} />
                {locale === "fr" ? "Changer la taille" : "تغيير الحجم"}
              </button>
              <div className="text-center">
                <span className="text-sm text-zinc-400 font-medium">
                  <bdi dir="ltr">{selectedSizePricing.size}</bdi> {locale === "fr" ? "parfums" : "عطور"}
                </span>
                <span className="mx-3 text-zinc-200">·</span>
                <Price amount={selectedSizePricing.price} className="text-lg font-bold text-zinc-900" />
              </div>
              <div className="text-sm font-medium text-zinc-500">
                <bdi dir="ltr">{selectedPerfumeIds.length} / {selectedSizePricing.size}</bdi>
              </div>
            </div>
          )}
        </div>

        {/* ── Step 2: Perfume picker ── */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-heading font-semibold text-zinc-900 mb-6 text-center">
              {t("step2Title")}
            </h2>

            {/* Selection tray — where each chosen perfume "lands" */}
            {selectedPerfumes.length > 0 && (
              <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-4 md:p-5 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-zinc-900">
                    {locale === "fr" ? "Votre sélection" : "اختيارك"}
                  </p>
                  <p className="text-xs font-medium text-zinc-400">
                    {selectedPerfumes.length}/{selectedSize}
                  </p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {selectedPerfumes.map((perfume) => (
                    <div key={perfume!.id} className="relative shrink-0 w-16">
                      <button
                        type="button"
                        onClick={() => togglePerfume(perfume!.id)}
                        aria-label={locale === "fr" ? "Retirer" : "إزالة"}
                        className="absolute -top-1.5 -end-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-zinc-900 text-white shadow ring-2 ring-white transition-transform hover:scale-110"
                      >
                        <X size={11} />
                      </button>
                      <div className="size-16 overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-200">
                        {perfume!.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={perfume!.imageUrl}
                            alt={perfume!.name[locale]}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <p className="mt-1 truncate text-center text-[10px] text-zinc-500">
                        {perfume!.name[locale]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {PLACEHOLDER_PERFUMES.map((perfume) => (
                <PerfumePickerCard
                  key={perfume.id}
                  perfume={perfume}
                  locale={locale}
                  selected={selectedPerfumeIds.includes(perfume.id)}
                  disabled={selectedPerfumeIds.length >= (selectedSize ?? 0) && !selectedPerfumeIds.includes(perfume.id)}
                  onToggle={() => togglePerfume(perfume.id)}
                  selectedLabel={locale === "fr" ? "Sélectionné" : "محدد"}
                  outOfStockLabel={locale === "fr" ? "Rupture" : "نفد"}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      {step === 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-zinc-900 text-white p-2 rounded-full shadow-2xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-3 ps-6 py-2 min-w-0">
              <div className="min-w-0">
                <p className="font-semibold text-base truncate">
                  <bdi dir="ltr">{selectedPerfumeIds.length} / {selectedSize}</bdi>{" "}
                  {locale === "fr" ? "parfums" : "عطور"}
                </p>
                {selectedSizePricing && (
                  <Price amount={selectedSizePricing.price} className="text-sm text-zinc-400" />
                )}
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={!isComplete}
              size="lg"
              className={`h-12 px-8 rounded-full font-bold text-base transition-all duration-300 inline-flex items-center gap-1.5 ${
                isComplete
                  ? "bg-white text-zinc-900 hover:bg-zinc-100 hover:scale-105"
                  : "bg-white/10 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {isComplete ? (
                <>
                  {locale === "fr" ? "Commander" : "إتمام الطلب"}
                  <ChevronRight size={18} className={locale === "ar" ? "rotate-180" : ""} />
                </>
              ) : locale === "fr" ? (
                `Encore ${remaining}`
              ) : (
                `${remaining} بعد`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
