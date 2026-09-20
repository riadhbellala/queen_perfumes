"use client";

import React from "react";
import { Perfume } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, ShoppingBag, Info } from "lucide-react";

// Shared by homepage-box-builder.tsx and creez-votre-box-builder.tsx — the
// task that introduced this component required the two pages' perfume-picker
// cards to stay visually identical, so this is the single source of truth
// rather than two copies that could drift apart.
export function PerfumePickerCard({
  perfume,
  locale,
  selected,
  disabled,
  onToggle,
  addLabel,
  selectedLabel,
  outOfStockLabel,
}: {
  perfume: Perfume;
  locale: "fr" | "ar";
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  addLabel: string;
  selectedLabel: string;
  outOfStockLabel: string;
}) {
  const isUnavailable = !perfume.inStock;
  const isDisabledNotSelected = disabled && !selected;

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => !isUnavailable && onToggle()}
        disabled={isDisabledNotSelected || isUnavailable}
        className={`group relative block w-full text-start transition-opacity ${
          isUnavailable || isDisabledNotSelected ? "cursor-not-allowed opacity-40" : "cursor-pointer"
        }`}
      >
        {/* Image */}
        <div
          className={`relative aspect-[3/4] overflow-hidden bg-muted ${
            selected ? "outline outline-1 outline-foreground outline-offset-[5px]" : "ring-1 ring-border"
          }`}
        >
          {perfume.imageUrl ? (
            <img
              src={perfume.imageUrl}
              alt={perfume.name[locale]}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                isUnavailable ? "opacity-55" : ""
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300">
              <ShoppingBag size={40} />
            </div>
          )}

          {/* Out-of-stock always wins over the selected badge — the two
              can't coexist in practice (an unavailable perfume can't be
              toggled on), but keeping an explicit priority avoids ever
              stacking both. */}
          {isUnavailable ? (
            <span className="absolute start-3 top-3 z-10 text-[10.5px] font-semibold uppercase tracking-wide text-destructive/90">
              {outOfStockLabel}
            </span>
          ) : (
            selected && (
              <span className="absolute start-3 top-3 z-10 grid size-[26px] place-items-center bg-primary text-primary-foreground">
                <Check size={14} strokeWidth={3} />
              </span>
            )
          )}
        </div>

        {/* Caption */}
        <div className="mt-3 min-w-0">
          <h3 className="text-balance font-display text-xl font-medium leading-tight text-foreground lg:text-2xl">
            {perfume.name[locale]}
          </h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground lg:text-xs">
            {perfume.scentFamily} · {perfume.concentration}
          </p>
          <p
            className={`mt-1.5 text-[11px] font-medium uppercase tracking-wide lg:text-xs ${
              isUnavailable ? "text-destructive/90" : selected ? "text-accent" : "text-muted-foreground"
            }`}
          >
            {isUnavailable ? outOfStockLabel : selected ? selectedLabel : addLabel}
          </p>
        </div>
      </button>

      {/* Info dialog trigger — square, ≥44px touch target */}
      <Dialog>
        <DialogTrigger
          render={
            <button className="absolute end-2 top-2 z-10 flex size-11 items-center justify-center bg-background/80 text-foreground ring-1 ring-border backdrop-blur-sm transition-colors hover:bg-background focus:outline-none" />
          }
        >
          <Info size={16} />
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
                loading="lazy"
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
            <p className="text-zinc-600 leading-relaxed text-sm">{perfume.description[locale]}</p>
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
              className={`w-full h-12 rounded-full font-semibold ${
                selected
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {selected
                ? locale === "fr"
                  ? "Retirer de la box"
                  : "أزل من المجموعة"
                : locale === "fr"
                ? "Ajouter à la box"
                : "أضف إلى المجموعة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
