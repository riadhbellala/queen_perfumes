import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { mapPerfumeRow, mapPackSizePricingRow } from "@/lib/supabase/mappers";
import { CreezVotreBoxBuilder } from "@/components/shop/creez-votre-box-builder";

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
    <div className="bg-background min-h-screen">
      {/* Small hero — real product photo, dark overlay for legible white text.
          Deliberately shorter than /boxes's own hero (this page has the whole
          size+perfume picker below it and shouldn't push that too far down). */}
      <div className="relative flex min-h-[32vh] w-full items-center justify-center overflow-hidden bg-[url('/assets/herosection/box-creating.webp')] bg-cover bg-center px-6 py-12 md:min-h-[38vh]">
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 max-w-xl text-center">
          <h1 className="font-display text-4xl tracking-tight text-white drop-shadow-md md:text-5xl">
            {t("title")}
          </h1>
          <div className="mx-auto mt-4 h-px w-14 bg-white/40" />
          <p className="mt-4 text-sm text-white/85 md:text-base">{t("subtitle")}</p>
        </div>
      </div>

      <CreezVotreBoxBuilder perfumes={perfumes} pricing={pricing} />
    </div>
  );
}
