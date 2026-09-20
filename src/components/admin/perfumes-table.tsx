"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DeletePerfumeButton } from "@/components/admin/delete-perfume-button";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin-constants";
import { Pencil, Search, ShoppingBag, Trash2 } from "lucide-react";

export type AdminPerfumeRow = {
  id: string;
  name_fr: string;
  image_url: string | null;
  scent_family: string | null;
  concentration: string | null;
  price: number;
  stock: number;
  is_active: boolean;
};

export function PerfumesTable({ perfumes }: { perfumes: AdminPerfumeRow[] }) {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState(perfumes);
  const [query, setQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get("stock") === "faible");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((p) => !q || p.name_fr.toLowerCase().includes(q))
      .filter((p) => !lowStockOnly || p.stock < LOW_STOCK_THRESHOLD);
  }, [rows, query, lowStockOnly]);

  async function toggleActive(id: string, next: boolean) {
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: next } : p)));
    const supabase = createClient();
    const { error } = await supabase.from("perfumes").update({ is_active: next }).eq("id", id);
    if (error) {
      setRows((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !next } : p)));
      toast.error("Impossible de mettre à jour le statut.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <Input
              placeholder="Rechercher un parfum…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg ps-9"
            />
          </div>
          <button
            type="button"
            onClick={() => setLowStockOnly((v) => !v)}
            className={`w-full shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:w-auto ${
              lowStockOnly ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Stock faible uniquement
          </button>
        </div>
        <Link href="/admin/parfums/nouveau" className="w-full sm:w-auto">
          <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 sm:w-auto">Nouveau parfum</Button>
        </Link>
      </div>

      {/* Mobile: stacked cards — a wide data table forces sideways scrolling
          on a phone, which is what made prices/stock hard to read there.
          Desktop keeps the real table below md:. */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((perfume) => (
          <div key={perfume.id} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-start gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-50">
                {perfume.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={perfume.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag className="text-zinc-300" size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">{perfume.name_fr}</p>
                <p className="truncate text-xs text-zinc-500">
                  {perfume.scent_family} · {perfume.concentration}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold text-zinc-900">{perfume.price} DA</span>
                  <span className="text-zinc-300">·</span>
                  {perfume.stock < LOW_STOCK_THRESHOLD ? (
                    <Badge variant="destructive">Stock : {perfume.stock}</Badge>
                  ) : (
                    <span className="text-zinc-500">Stock : {perfume.stock}</span>
                  )}
                </div>
              </div>
              <Switch
                checked={perfume.is_active}
                onCheckedChange={(v) => toggleActive(perfume.id, v)}
                className="shrink-0"
              />
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3">
              <Link href={`/admin/parfums/${perfume.id}`} className="flex-1">
                <Button variant="outline" className="h-10 w-full gap-2">
                  <Pencil size={14} />
                  Modifier
                </Button>
              </Link>
              <DeletePerfumeButton
                perfumeId={perfume.id}
                perfumeName={perfume.name_fr}
                imageUrl={perfume.image_url}
                onDeleted={() => setRows((prev) => prev.filter((p) => p.id !== perfume.id))}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Supprimer"
                    className="h-10 w-10 shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                }
              />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-zinc-200 bg-white py-10 text-center text-sm text-zinc-500">
            Aucun parfum trouvé.
          </p>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Nom</TableHead>
              <TableHead>Famille</TableHead>
              <TableHead>Concentration</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actif</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((perfume) => (
              <TableRow key={perfume.id}>
                <TableCell>
                  <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-zinc-50">
                    {perfume.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={perfume.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="text-zinc-300" size={16} />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-zinc-900">{perfume.name_fr}</TableCell>
                <TableCell className="text-zinc-500">{perfume.scent_family}</TableCell>
                <TableCell className="text-zinc-500">{perfume.concentration}</TableCell>
                <TableCell className="text-zinc-900">{perfume.price} DA</TableCell>
                <TableCell>
                  {perfume.stock < LOW_STOCK_THRESHOLD ? (
                    <Badge variant="destructive">{perfume.stock}</Badge>
                  ) : (
                    <span className="text-zinc-900">{perfume.stock}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch checked={perfume.is_active} onCheckedChange={(v) => toggleActive(perfume.id, v)} />
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/parfums/${perfume.id}`}>
                      <Button variant="outline" size="icon-sm" aria-label="Modifier">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <DeletePerfumeButton
                      perfumeId={perfume.id}
                      perfumeName={perfume.name_fr}
                      imageUrl={perfume.image_url}
                      onDeleted={() => setRows((prev) => prev.filter((p) => p.id !== perfume.id))}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-zinc-500">
                  Aucun parfum trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
