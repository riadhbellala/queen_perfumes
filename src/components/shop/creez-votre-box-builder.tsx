"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
import { Check, CheckCircle2, ShoppingBag, Info, ChevronLeft, ChevronRight, X } from "lucide-react";

// Real product photography for each box size, one per pricing tier.
const SIZE_IMAGES: Record<number, string> = {
  2: "/assets/perfumes-boxes/2perfumes.webp",
  3: "/assets/perfumes-boxes/3perfumes.webp",
  4: "/assets/perfumes-boxes/4perfumes.webp",
  5: "/assets/perfumes-boxes/5perfumes.webp",
  6: "/assets/perfumes-boxes/6perfumes.webp",
};

// A short, plain-spoken line per size — what it's actually good for, not a
// spec sheet. Written for someone browsing on their phone, not a copywriter.
const SIZE_TAGLINES: Record<number, { fr: string; ar: string }> = {
  2: { fr: "Idéal pour découvrir en douceur", ar: "بداية لطيفة لتجربة عطرين" },
  3: { fr: "Un joli trio, bien équilibré", ar: "ثلاثية متوازنة تناسبك" },
  4: { fr: "Notre format préféré", ar: "الحجم الأكثر تفضيلاً" },
  5: { fr: "Pour celles qui aiment varier", ar: "لمن تحب التنويع بين العطور" },
  6: { fr: "La collection complète, pour tout avoir", ar: "المجموعة الكاملة، لتجربة كل شيء" },
};

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
          done || active ? "bg-primary text-primary-foreground" : "bg-muted text-zinc-400"
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
      <div className={`h-px w-10 transition-colors ${step > 1 ? "bg-primary" : "bg-border"}`} />
      <StepDot index={2} label={labels[1]} active={step === 2} done={false} />
    </div>
  );
}

// A thin fill bar tracking "n of size" — pairs with the numeric counters
// already on screen so progress reads at a glance, not just as digits.
function SelectionProgressBar({
  current,
  total,
  tone = "light",
}: {
  current: number;
  total: number;
  tone?: "light" | "dark";
}) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full ${
        tone === "dark" ? "bg-white/15" : "bg-muted"
      }`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ease-out ${
          tone === "dark" ? "bg-white" : "bg-primary"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Step 1: Size selector card ─────────────────────────────────────────────
// A real photo of the box for that size, with the size/price caption sitting
// naturally on the image itself rather than in a separate plain panel.
function SizeCard({
  size,
  price,
  selected,
  onClick,
  perfumesLabel,
  tagline,
  imageSrc,
  large,
}: {
  size: number;
  price: number;
  selected: boolean;
  onClick: () => void;
  perfumesLabel: string;
  tagline: string;
  imageSrc: string;
  /** The 6-perfume tier gets a bigger, full-width showcase treatment */
  large?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-3xl text-center transition-all duration-300 active:scale-[0.98] ${
        large ? "aspect-[16/11] sm:aspect-[21/9]" : "aspect-[16/11]"
      } ${selected ? "ring-2 ring-primary ring-offset-2 shadow-xl" : "ring-1 ring-border hover:shadow-lg"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={`${size} ${perfumesLabel}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />
      {/* Even darkening (not a bottom-only gradient) so the caption stays
          readable centered anywhere on the photo, not just near an edge */}
      <div className="absolute inset-0 bg-black/50 transition-colors duration-300 group-hover:bg-black/60" />

      {selected && (
        <div className={`absolute top-4 end-4 flex items-center justify-center rounded-full bg-white shadow-md ${large ? "size-8 sm:size-9" : "size-8"}`}>
          <CheckCircle2 size={18} className="text-zinc-900" />
        </div>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center px-5">
        <p
          className={`font-heading font-bold text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)] ${
            large ? "text-3xl sm:text-4xl md:text-5xl" : "text-3xl md:text-4xl"
          }`}
        >
          <bdi dir="ltr">{size}</bdi> {perfumesLabel}
        </p>
        <p className={`mt-2 font-medium text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)] ${large ? "text-base sm:text-lg" : "text-base"}`}>
          {tagline}
        </p>
        <Price
          amount={price}
          className={`mt-4 font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.5)] ${large ? "text-2xl sm:text-3xl" : "text-2xl"}`}
        />
      </div>
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
        className={`group relative w-full overflow-hidden rounded-xl text-start transition-all duration-200 ${
          selected
            ? "ring-2 ring-primary shadow-lg"
            : isDisabledNotSelected || isUnavailable
            ? "ring-1 ring-border opacity-40 cursor-not-allowed"
            : "ring-1 ring-border hover:shadow-md hover:ring-primary/50 cursor-pointer"
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
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

          {selected && <div className="absolute inset-0 bg-primary/10" />}

          {/* Out-of-stock always wins over the selected badge — the two
              can't coexist in practice, but keeping an explicit priority
              avoids ever stacking both. */}
          {isUnavailable ? (
            <span className="absolute start-2 top-2 z-10 rounded-full bg-red-950/85 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-sm">
              {outOfStockLabel}
            </span>
          ) : (
            selected && (
              <span className="absolute start-2 top-2 z-10 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Check size={12} strokeWidth={3} />
                <span className="sr-only">{selectedLabel}</span>
              </span>
            )
          )}
        </div>

        {/* Caption */}
        <div className="p-3">
          <p className="font-display text-sm font-semibold leading-tight text-foreground">{perfume.name[locale]}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-400">
            {perfume.scentFamily} · {perfume.concentration}
          </p>
        </div>
      </button>

      {/* Info Dialog */}
      <Dialog>
        <DialogTrigger
          render={
            <button className="absolute end-2 top-2 z-10 rounded-full bg-white/80 p-1.5 text-zinc-600 shadow-sm ring-1 ring-black/5 backdrop-blur-md transition-colors hover:bg-white hover:text-zinc-900 focus:outline-none" />
          }
        >
          <Info size={15} />
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
              <span className="bg-muted text-zinc-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                {perfume.scentFamily}
              </span>
              <span className="bg-muted text-zinc-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
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
              className={`w-full h-12 rounded-full font-semibold ${selected ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
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

// ─── Main builder ────────────────────────────────────────────────────────────
export function CreezVotreBoxBuilder({
  perfumes,
  pricing,
}: {
  perfumes: Perfume[];
  pricing: PackSizePricing[];
}) {
  const t = useTranslations("PackBuilder");
  const locale = useLocale() as "fr" | "ar";
  const router = useRouter();
  const { addItem } = useCart();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSize, setSelectedSize] = useState<2 | 3 | 4 | 5 | 6 | null>(null);
  const [selectedPerfumeIds, setSelectedPerfumeIds] = useState<string[]>([]);

  const selectedSizePricing = useMemo(
    () => pricing.find((p) => p.size === selectedSize) ?? null,
    [selectedSize, pricing]
  );

  const selectedPerfumes = useMemo(
    () => selectedPerfumeIds.map((id) => perfumes.find((p) => p.id === id)).filter(Boolean),
    [selectedPerfumeIds, perfumes]
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
      perfumes: selectedPerfumeIds
        .map((id) => perfumes.find((p) => p.id === id))
        .filter((p): p is Perfume => Boolean(p))
        .map(toCartPerfumeSummary),
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
    <div className="pb-36">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pt-10 pb-12 md:pt-12">

        <StepProgress
          step={step}
          labels={[
            locale === "fr" ? "Taille" : "الحجم",
            locale === "fr" ? "Parfums" : "العطور",
          ]}
        />

        {/* ── Step 1: Size selection ── */}
        {step === 1 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-heading font-semibold text-zinc-900 mb-8 text-center">
              {t("step1Title")}
            </h2>
            <div className="max-w-5xl mx-auto space-y-5 md:space-y-6">
              <div className="stagger-fade grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {pricing
                  .filter(({ size }) => size !== 6)
                  .map(({ size, price }) => (
                    <SizeCard
                      key={size}
                      size={size}
                      price={price}
                      selected={selectedSize === size}
                      perfumesLabel={locale === "fr" ? "parfums" : "عطور"}
                      tagline={locale === "fr" ? SIZE_TAGLINES[size].fr : SIZE_TAGLINES[size].ar}
                      imageSrc={SIZE_IMAGES[size]}
                      onClick={() => handleSizeSelect(size as 2 | 3 | 4 | 5 | 6)}
                    />
                  ))}
              </div>
              {pricing
                .filter(({ size }) => size === 6)
                .map(({ size, price }) => (
                  <SizeCard
                    key={size}
                    size={size}
                    price={price}
                    selected={selectedSize === size}
                    perfumesLabel={locale === "fr" ? "parfums" : "عطور"}
                    tagline={locale === "fr" ? SIZE_TAGLINES[size].fr : SIZE_TAGLINES[size].ar}
                    imageSrc={SIZE_IMAGES[size]}
                    onClick={() => handleSizeSelect(size as 2 | 3 | 4 | 5 | 6)}
                    large
                  />
                ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Perfume picker ── */}
        {step === 2 && selectedSizePricing && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-heading font-semibold text-zinc-900 mb-6 text-center">
              {t("step2Title")}
            </h2>

            {/* Unified size-and-selection panel — one card instead of two
                near-identical ones stacked on top of each other */}
            <div className="mb-8 rounded-2xl border border-border bg-card p-5 md:p-6 max-w-3xl mx-auto shadow-sm">
              <div className="flex items-center justify-between">
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
              <div className="mt-4">
                <SelectionProgressBar current={selectedPerfumeIds.length} total={selectedSizePricing.size} />
              </div>

              {/* Where each chosen perfume "lands"; always visible so the
                  empty state guides the next action instead of the section
                  just being absent */}
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-sm font-semibold text-zinc-900 mb-3">
                  {locale === "fr" ? "Votre sélection" : "اختيارك"}
                </p>
                {selectedPerfumes.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {selectedPerfumes.map((perfume) => (
                      <div key={perfume!.id} className="relative shrink-0 w-16 animate-in fade-in zoom-in-95 duration-200">
                        <button
                          type="button"
                          onClick={() => togglePerfume(perfume!.id)}
                          aria-label={locale === "fr" ? "Retirer" : "إزالة"}
                          className="absolute -top-1.5 -end-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-white transition-transform duration-150 ease-out active:scale-90"
                        >
                          <X size={11} />
                        </button>
                        <div className="size-16 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
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
                ) : (
                  <p className="text-sm text-zinc-400">
                    {locale === "fr"
                      ? "Choisissez vos parfums ci-dessous pour composer votre box."
                      : "اختاري عطورك في الأسفل لتشكيل مجموعتك."}
                  </p>
                )}
              </div>
            </div>

            <div className="stagger-fade grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {perfumes.map((perfume) => (
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
          <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-2xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-3 ps-6 py-2 min-w-0">
              <div className="min-w-0">
                <p className="font-semibold text-base truncate">
                  <bdi dir="ltr">{selectedPerfumeIds.length} / {selectedSize}</bdi>{" "}
                  {locale === "fr" ? "parfums" : "عطور"}
                </p>
                {selectedSizePricing && (
                  <Price amount={selectedSizePricing.price} className="text-sm text-primary-foreground/70" />
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
