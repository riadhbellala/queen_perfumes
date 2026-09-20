"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingBag, Search } from "lucide-react";

export type SelectablePerfume = {
  id: string;
  name_fr: string;
  image_url: string | null;
};

export function PerfumeMultiSelect({
  perfumes,
  selectedIds,
  onChange,
}: {
  perfumes: SelectablePerfume[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return perfumes;
    return perfumes.filter((p) => p.name_fr.toLowerCase().includes(q));
  }, [perfumes, query]);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((existing) => existing !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200">
      <div className="flex flex-col gap-3 border-b border-zinc-100 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative sm:flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <Input
            placeholder="Rechercher un parfum…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-md ps-8 text-sm"
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-zinc-600">
          {selectedIds.length} parfum{selectedIds.length > 1 ? "s" : ""} sélectionné
          {selectedIds.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-zinc-400">Aucun parfum trouvé.</p>
        )}
        {filtered.map((perfume) => {
          const checked = selectedIds.includes(perfume.id);
          return (
            <label
              key={perfume.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors ${
                checked ? "bg-zinc-100" : "hover:bg-zinc-50"
              }`}
            >
              <Checkbox checked={checked} onCheckedChange={() => toggle(perfume.id)} />
              <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-50">
                {perfume.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={perfume.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag className="text-zinc-300" size={14} />
                )}
              </div>
              <span className="text-sm text-zinc-900">{perfume.name_fr}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
