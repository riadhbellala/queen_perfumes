import { createClient } from "@/lib/supabase/server";
import { PerfumesTable, type AdminPerfumeRow } from "@/components/admin/perfumes-table";

export default async function AdminParfumsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("perfumes")
    .select("id, name_fr, image_url, scent_family, concentration, price, stock, is_active")
    .order("created_at", { ascending: true });

  const perfumes: AdminPerfumeRow[] = (data ?? []).map((row) => ({
    id: row.id,
    name_fr: row.name_fr,
    image_url: row.image_url,
    scent_family: row.scent_family,
    concentration: row.concentration,
    price: Number(row.price),
    stock: row.stock,
    is_active: row.is_active,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Parfums</h1>
      <p className="mt-1 text-sm text-zinc-500">{perfumes.length} parfum(s) au catalogue.</p>

      <div className="mt-6">
        <PerfumesTable perfumes={perfumes} />
      </div>
    </div>
  );
}
