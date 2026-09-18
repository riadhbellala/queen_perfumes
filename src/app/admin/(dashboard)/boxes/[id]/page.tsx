import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoxForm, type BoxFormInitialData } from "@/components/admin/box-form";
import { DeleteBoxButtonWithRedirect } from "@/components/admin/delete-box-button-with-redirect";
import type { SelectablePerfume } from "@/components/admin/perfume-multi-select";
import { ChevronLeft } from "lucide-react";

export default async function AdminEditBoxPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pack } = await supabase
    .from("packs")
    .select("*, pack_perfumes(perfume_id)")
    .eq("id", id)
    .maybeSingle();

  if (!pack) {
    notFound();
  }

  const linkedIds: string[] = (pack.pack_perfumes ?? []).map(
    (pp: { perfume_id: string }) => pp.perfume_id
  );

  const [{ data: activePerfumes }, { data: linkedPerfumes }] = await Promise.all([
    supabase.from("perfumes").select("id, name_fr, image_url").eq("is_active", true),
    linkedIds.length
      ? supabase.from("perfumes").select("id, name_fr, image_url").in("id", linkedIds)
      : Promise.resolve({ data: [] as SelectablePerfume[] }),
  ]);

  // Merge active perfumes with any already-linked-but-now-inactive ones, so
  // a perfume already in this box never silently disappears from the list.
  const merged = new Map<string, SelectablePerfume>();
  for (const p of activePerfumes ?? []) merged.set(p.id, p);
  for (const p of linkedPerfumes ?? []) merged.set(p.id, p);
  const selectablePerfumes = [...merged.values()].sort((a, b) => a.name_fr.localeCompare(b.name_fr));

  const initialData: BoxFormInitialData = {
    id: pack.id,
    name_fr: pack.name_fr,
    name_ar: pack.name_ar,
    description_fr: pack.description_fr ?? "",
    description_ar: pack.description_ar ?? "",
    price: Number(pack.price),
    is_active: pack.is_active,
    image_url: pack.image_url,
    perfumeIds: linkedIds,
  };

  return (
    <div>
      <Link
        href="/admin/boxes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"
      >
        <ChevronLeft size={16} />
        Retour aux boxes
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Modifier « {pack.name_fr} »</h1>
        <DeleteBoxButtonWithRedirect packId={pack.id} packName={pack.name_fr} imageUrl={pack.image_url} />
      </div>

      <div className="mt-6 max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6">
        <BoxForm mode="edit" perfumes={selectablePerfumes} initialData={initialData} />
      </div>
    </div>
  );
}
