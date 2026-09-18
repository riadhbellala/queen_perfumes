"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export type DeliveryFeeRow = { wilaya: string; fee: number };

export function DeliveryFeesForm({ initialRows }: { initialRows: DeliveryFeeRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.wilaya.toLowerCase().includes(q));
  }, [rows, query]);

  function updateFee(wilaya: string, value: string) {
    setRows((prev) => prev.map((r) => (r.wilaya === wilaya ? { ...r, fee: Number(value) } : r)));
  }

  async function handleSave() {
    const nextErrors: Record<string, string> = {};
    for (const row of rows) {
      if (!Number.isFinite(row.fee) || row.fee < 0) {
        nextErrors[row.wilaya] = "Doit être un nombre positif.";
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Only send rows that actually changed vs. what was loaded — 69 rows is
    // small either way, but no reason to rewrite untouched ones.
    const changed = rows.filter((row, i) => row.fee !== initialRows[i]?.fee);
    if (changed.length === 0) {
      toast.success("Aucune modification à enregistrer.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("wilaya_delivery_fees")
      .upsert(changed, { onConflict: "wilaya" });
    setSaving(false);

    if (error) {
      console.error("Failed to save delivery fees:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement.");
      return;
    }

    toast.success(`${changed.length} tarif(s) mis à jour.`);
  }

  return (
    <div>
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <Input
          placeholder="Rechercher une wilaya…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 rounded-lg ps-9"
        />
      </div>

      <div className="max-h-[32rem] overflow-y-auto rounded-2xl border border-zinc-200">
        <div className="divide-y divide-zinc-100">
          {filtered.map((row) => (
            <div key={row.wilaya} className="flex items-center justify-between gap-4 bg-white p-4">
              <p className="font-medium text-zinc-900">{row.wilaya}</p>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={row.fee}
                    onChange={(e) => updateFee(row.wilaya, e.target.value)}
                    className="h-10 w-28 rounded-lg text-end"
                  />
                  <span className="text-sm text-zinc-500">DA</span>
                </div>
                {errors[row.wilaya] && <p className="text-xs text-destructive">{errors[row.wilaya]}</p>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-zinc-500">Aucune wilaya trouvée.</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-zinc-100 pt-6">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
}
