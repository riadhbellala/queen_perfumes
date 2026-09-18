import { createClient } from "@/lib/supabase/server";
import { DeliveryFeesForm, type DeliveryFeeRow } from "@/components/admin/delivery-fees-form";
import { WILAYAS } from "@/lib/wilayas";

export default async function AdminLivraisonPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("wilaya_delivery_fees").select("wilaya, fee");

  const feeByWilaya = new Map((data ?? []).map((row) => [row.wilaya, Number(row.fee)]));
  // Same order as the checkout's wilaya <Select> (by code), not alphabetical.
  const rows: DeliveryFeeRow[] = WILAYAS.map((w) => ({
    wilaya: w.name.fr,
    fee: feeByWilaya.get(w.name.fr) ?? 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Frais de livraison</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Un tarif par wilaya, appliqué automatiquement au récapitulatif de commande sur le site.
      </p>

      <div className="mt-6 max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
        <DeliveryFeesForm initialRows={rows} />
      </div>
    </div>
  );
}
