import { createClient } from "@/lib/supabase/server";
import { BoxesTable, type AdminBoxRow } from "@/components/admin/boxes-table";

export default async function AdminBoxesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("packs")
    .select("id, name_fr, image_url, price, is_active, pack_perfumes(count)")
    .order("created_at", { ascending: true });

  const boxes: AdminBoxRow[] = (data ?? []).map((row) => ({
    id: row.id,
    name_fr: row.name_fr,
    image_url: row.image_url,
    price: Number(row.price),
    is_active: row.is_active,
    perfumeCount: row.pack_perfumes?.[0]?.count ?? 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Boxes</h1>
      <p className="mt-1 text-sm text-zinc-500">{boxes.length} box(es) au catalogue.</p>

      <div className="mt-6">
        <BoxesTable boxes={boxes} />
      </div>
    </div>
  );
}
