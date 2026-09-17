import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { mapPerfumeRow, mapPackSizePricingRow } from "@/lib/supabase/mappers";
import { CreezVotreBoxBuilder } from "@/components/shop/creez-votre-box-builder";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";

export default async function CreezVotreBoxPage() {
  const t = await getTranslations("PackBuilder");

  const supabase = await createClient();
  const [{ data: perfumeRows }, { data: pricingRows }] = await Promise.all([
    supabase.from("perfumes").select("*").eq("is_active", true).order("created_at", { ascending: true }),
    supabase.from("pack_size_pricing").select("size, price").order("size", { ascending: true }),
  ]);

  const perfumes = (perfumeRows ?? []).map(mapPerfumeRow);
  const pricing = (pricingRows ?? []).map(mapPackSizePricingRow);

  return (
    <div className="bg-zinc-50/50 min-h-screen">
      {/* Just the title — no separate hero banner, the grid follows right below */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8">
        <HandWrittenTitle title={t("title")} subtitle="" />
      </div>

      <CreezVotreBoxBuilder perfumes={perfumes} pricing={pricing} />
    </div>
  );
}
