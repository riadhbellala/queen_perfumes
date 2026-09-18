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
import { Pencil, Search, ShoppingBag } from "lucide-react";

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <Input
              placeholder="Rechercher un parfum…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 rounded-lg ps-9"
            />
          </div>
          <button
            type="button"
            onClick={() => setLowStockOnly((v) => !v)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              lowStockOnly ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Stock faible uniquement
          </button>
        </div>
        <Link href="/admin/parfums/nouveau">
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800">Nouveau parfum</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
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
