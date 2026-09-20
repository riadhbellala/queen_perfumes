"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, X } from "lucide-react";

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
      <p className="mb-3 text-sm font-semibold text-foreground">{label}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
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

  const activeFilterCount =
    selectedFamilies.length +
    selectedConcentrations.length +
    (priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max ? 1 : 0);

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
          <p className="mb-4 text-sm font-semibold text-foreground">
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
        className="text-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("resetFilters")}
      </button>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      {query.trim() && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/50 px-4 py-3 sm:px-5">
          <p className="text-sm text-foreground">
            {t("searchResults", { query: query.trim() })}
          </p>
          <Link
            href={`/${locale}/parfums`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={14} />
            {t("clearSearch")}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[240px_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="sticky top-24 hidden self-start lg:block">{filtersContent}</aside>

        <div>
          {/* Sort bar + mobile filter trigger */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              {t("count", { count: filtered.length })}
            </p>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-full lg:hidden"
                    />
                  }
                >
                  <SlidersHorizontal size={14} />
                  {t("filters")}
                  {activeFilterCount > 0 && (
                    <span className="ms-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      <bdi dir="ltr">{activeFilterCount}</bdi>
                    </span>
                  )}
                </SheetTrigger>
                <SheetContent side={locale === "ar" ? "right" : "left"} className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{t("filters")}</SheetTitle>
                  </SheetHeader>
                  <div className="p-4">{filtersContent}</div>
                </SheetContent>
              </Sheet>

              {/* Mobile sort — desktop uses pill row below */}
              <div className="sm:hidden">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                  <SelectTrigger size="sm" className="min-w-[140px] rounded-full">
                    <SelectValue placeholder={t("sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(({ key, label }) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden items-center gap-2 overflow-x-auto sm:flex">
                {sortOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      sortBy === key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="mb-2 text-lg font-semibold text-foreground">{t("noResults")}</p>
              <p className="mb-6 text-muted-foreground">{t("noResultsDesc")}</p>
              <Button variant="outline" onClick={resetFilters} className="rounded-full">
                {t("resetFilters")}
              </Button>
            </div>
          ) : (
            <div className="stagger-fade grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-3">
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
