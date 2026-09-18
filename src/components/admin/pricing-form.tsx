"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export type PricingRow = { size: number; price: number };

function sizeLabel(size: number): string {
  return `Box de ${size} parfums`;
}

export function PricingForm({ initialRows }: { initialRows: PricingRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => [...rows].sort((a, b) => a.size - b.size), [rows]);

  // A larger size priced lower than a smaller one is almost always a
  // mistake — flagged as a soft warning, never blocked, since there could
  // be a real promotional reason for it.
  const orderWarnings = useMemo(() => {
    const warnings = new Set<number>();
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].price < sorted[i - 1].price) {
        warnings.add(sorted[i].size);
      }
    }
    return warnings;
  }, [sorted]);

  function updatePrice(size: number, value: string) {
    setRows((prev) => prev.map((r) => (r.size === size ? { ...r, price: Number(value) } : r)));
  }

  async function handleSave() {
    const nextErrors: Record<number, string> = {};
    for (const row of rows) {
      if (!Number.isFinite(row.price) || row.price <= 0) {
        nextErrors[row.size] = "Le prix doit être un nombre positif.";
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("pack_size_pricing")
      .upsert(rows, { onConflict: "size" });
    setSaving(false);

    if (error) {
      console.error("Failed to save pricing:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement.");
      return;
    }

    toast.success("Tarifs mis à jour avec succès.");
  }

  return (
    <div className="flex flex-col gap-5">
      {sorted.map((row) => (
        <Field
          key={row.size}
          data-invalid={!!errors[row.size]}
          orientation="horizontal"
          className="items-center gap-4"
        >
          <FieldLabel htmlFor={`price-${row.size}`} className="w-40 shrink-0">
            {sizeLabel(row.size)}
          </FieldLabel>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <Input
                id={`price-${row.size}`}
                type="number"
                min="0"
                step="1"
                value={row.price}
                onChange={(e) => updatePrice(row.size, e.target.value)}
                className="h-11 max-w-40 rounded-lg"
              />
              <span className="text-sm text-zinc-500">DA</span>
            </div>
            {errors[row.size] && <p className="text-sm text-destructive">{errors[row.size]}</p>}
            {!errors[row.size] && orderWarnings.has(row.size) && (
              <p className="flex items-center gap-1.5 text-sm text-amber-600">
                <AlertTriangle size={14} />
                Ce prix est inférieur à celui d&apos;une taille plus petite — vérifiez que c&apos;est
                voulu.
              </p>
            )}
          </div>
        </Field>
      ))}

      <div className="flex justify-end border-t border-zinc-100 pt-6">
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
