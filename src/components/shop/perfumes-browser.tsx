"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Perfume } from "@/types";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";

type SortKey = "relevance" | "price-asc" | "price-desc" | "name-asc";

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-semibold text-zinc-900 mb-3">{label}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-600">
            <Checkbox
              checked={selected.includes(option)}
              onCheckedChange={() => onToggle(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

export function PerfumesBrowser({ perfumes }: { perfumes: Perfume[] }) {
  const locale = useLocale() as "fr" | "ar";
  const t = useTranslations("Perfumes");
  // Pre-filter from the drawer's search box (?q=<value>) — reactive to the
  // URL, no local state needed since there's no on-page search input to
  // desync from it.
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const scentFamilies = useMemo(
    () => Array.from(new Set(perfumes.map((p) => p.scentFamily).filter(Boolean))).sort(),
    [perfumes]
  );
  const concentrations = useMemo(
    () => Array.from(new Set(perfumes.map((p) => p.concentration).filter(Boolean))).sort(),
    [perfumes]
  );
  const priceBounds = useMemo(() => {
    const prices = perfumes.map((p) => p.price ?? 0);
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [perfumes]);

  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedConcentrations, setSelectedConcentrations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([priceBounds.min, priceBounds.max]);
  const [sortBy, setSortBy] = useState<SortKey>("relevance");

  function toggle(list: string[], value: string, setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function resetFilters() {
    setSelectedFamilies([]);
    setSelectedConcentrations([]);
    setPriceRange([priceBounds.min, priceBounds.max]);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = perfumes.filter((p) => {
      const matchesFamily = selectedFamilies.length === 0 || selectedFamilies.includes(p.scentFamily);
      const matchesConcentration =
        selectedConcentrations.length === 0 || selectedConcentrations.includes(p.concentration);
      const price = p.price ?? 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesQuery = !q || p.name[locale].toLowerCase().includes(q);
      return matchesFamily && matchesConcentration && matchesPrice && matchesQuery;
    });

    result = [...result];
    if (sortBy === "price-asc") result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sortBy === "price-desc") result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sortBy === "name-asc") result.sort((a, b) => a.name[locale].localeCompare(b.name[locale]));

    return result;
  }, [perfumes, selectedFamilies, selectedConcentrations, priceRange, sortBy, locale, query]);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "relevance", label: t("sortRelevance") },
    { key: "price-asc", label: t("sortPriceAsc") },
    { key: "price-desc", label: t("sortPriceDesc") },
    { key: "name-asc", label: t("sortNameAsc") },
  ];

  const filtersContent = (
    <div className="flex flex-col gap-8">
      <FilterGroup
        label={t("family")}
        options={scentFamilies}
        selected={selectedFamilies}
        onToggle={(v) => toggle(selectedFamilies, v, setSelectedFamilies)}
      />
      <FilterGroup
        label={t("concentration")}
        options={concentrations}
        selected={selectedConcentrations}
        onToggle={(v) => toggle(selectedConcentrations, v, setSelectedConcentrations)}
      />
      {priceBounds.max > priceBounds.min && (
        <div>
          <p className="text-sm font-semibold text-zinc-900 mb-4">
            {t("price", { min: priceRange[0], max: priceRange[1] })}
          </p>
          <Slider
            min={priceBounds.min}
            max={priceBounds.max}
            step={100}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
          />
        </div>
      )}
      <button
        type="button"
        onClick={resetFilters}
        className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors text-start"
      >
        {t("resetFilters")}
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block sticky top-24 self-start">{filtersContent}</aside>

        <div>
          {/* Sort bar + mobile filter trigger */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <p className="text-sm text-zinc-500 font-medium">
              {t("count", { count: filtered.length })}
            </p>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="sm" className="lg:hidden rounded-full gap-1.5" />
                  }
                >
                  <SlidersHorizontal size={14} />
                  {t("filters")}
                </SheetTrigger>
                <SheetContent side={locale === "ar" ? "right" : "left"} className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{t("filters")}</SheetTitle>
                  </SheetHeader>
                  <div className="p-4">{filtersContent}</div>
                </SheetContent>
              </Sheet>

              <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
                {sortOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
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

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-lg font-semibold text-zinc-900 mb-2">{t("noResults")}</p>
              <p className="text-zinc-500 mb-6">{t("noResultsDesc")}</p>
              <Button variant="outline" onClick={resetFilters} className="rounded-full">
                {t("resetFilters")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
              {filtered.map((perfume) => (
                <ProductCard key={perfume.id} product={perfume} type="perfume" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
