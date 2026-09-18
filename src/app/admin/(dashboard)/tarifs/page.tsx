import { createClient } from "@/lib/supabase/server";
import { PricingForm, type PricingRow } from "@/components/admin/pricing-form";

export default async function AdminTarifsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pack_size_pricing")
    .select("size, price")
    .order("size", { ascending: true });

  const rows: PricingRow[] = (data ?? []).map((row) => ({
    size: row.size,
    price: Number(row.price),
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Tarifs des Boxes</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Prix appliqués selon le nombre de parfums choisis dans « Créez votre box ».
      </p>

      <div className="mt-6 max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
        <PricingForm initialRows={rows} />
      </div>
    </div>
  );
}
