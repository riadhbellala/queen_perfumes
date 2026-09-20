"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DeleteBoxButton } from "@/components/admin/delete-box-button";
import { Pencil, Search, ShoppingBag, Trash2 } from "lucide-react";

export type AdminBoxRow = {
  id: string;
  name_fr: string;
  image_url: string | null;
  price: number;
  perfumeCount: number;
  is_active: boolean;
};

export function BoxesTable({ boxes }: { boxes: AdminBoxRow[] }) {
  const [rows, setRows] = useState(boxes);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => p.name_fr.toLowerCase().includes(q));
  }, [rows, query]);

  async function toggleActive(id: string, next: boolean) {
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: next } : p)));
    const supabase = createClient();
    const { error } = await supabase.from("packs").update({ is_active: next }).eq("id", id);
    if (error) {
      setRows((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !next } : p)));
      toast.error("Impossible de mettre à jour le statut.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <Input
            placeholder="Rechercher une box…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-lg ps-9"
          />
        </div>
        <Link href="/admin/boxes/nouveau" className="w-full sm:w-auto">
          <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 sm:w-auto">Nouvelle box</Button>
        </Link>
      </div>

      {/* Mobile: stacked cards — a wide data table forces sideways scrolling
          on a phone. Desktop keeps the real table below md:. */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((box) => (
          <div key={box.id} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-start gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-50">
                {box.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={box.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag className="text-zinc-300" size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">{box.name_fr}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold text-zinc-900">{box.price} DA</span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-zinc-500">
                    {box.perfumeCount} parfum{box.perfumeCount > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <Switch
                checked={box.is_active}
                onCheckedChange={(v) => toggleActive(box.id, v)}
                className="shrink-0"
              />
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3">
              <Link href={`/admin/boxes/${box.id}`} className="flex-1">
                <Button variant="outline" className="h-10 w-full gap-2">
                  <Pencil size={14} />
                  Modifier
                </Button>
              </Link>
              <DeleteBoxButton
                packId={box.id}
                packName={box.name_fr}
                imageUrl={box.image_url}
                onDeleted={() => setRows((prev) => prev.filter((p) => p.id !== box.id))}
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
            Aucune box trouvée.
          </p>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Nom</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Parfums inclus</TableHead>
              <TableHead>Actif</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((box) => (
              <TableRow key={box.id}>
                <TableCell>
                  <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-zinc-50">
                    {box.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={box.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="text-zinc-300" size={16} />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-zinc-900">{box.name_fr}</TableCell>
                <TableCell className="text-zinc-900">{box.price} DA</TableCell>
                <TableCell className="text-zinc-500">{box.perfumeCount}</TableCell>
                <TableCell>
                  <Switch checked={box.is_active} onCheckedChange={(v) => toggleActive(box.id, v)} />
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/boxes/${box.id}`}>
                      <Button variant="outline" size="icon-sm" aria-label="Modifier">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <DeleteBoxButton
                      packId={box.id}
                      packName={box.name_fr}
                      imageUrl={box.image_url}
                      onDeleted={() => setRows((prev) => prev.filter((p) => p.id !== box.id))}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                  Aucune box trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
