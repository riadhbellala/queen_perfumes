import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { mapPackRow } from "@/lib/supabase/mappers";
import { BoxesBrowser } from "@/components/shop/boxes-browser";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";

export default async function BoxesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Packs");

  const supabase = await createClient();
  const [{ data: packRows }, { data: perfumeRows }, { data: pricingRows }] = await Promise.all([
    supabase
      .from("packs")
      .select("*, pack_perfumes(perfume_id)")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase.from("perfumes").select("id, image_url"),
    supabase.from("pack_size_pricing").select("price"),
  ]);

  const packs = (packRows ?? []).map((row) =>
    mapPackRow(row, (row.pack_perfumes ?? []).map((pp: { perfume_id: string }) => pp.perfume_id))
  );
  const perfumeImages: Record<string, string | undefined> = {};
  for (const row of perfumeRows ?? []) {
    perfumeImages[row.id] = row.image_url ?? undefined;
  }
  // Drives the CTA banner's "starting at X DA" line — was previously a
  // hardcoded "1 900 DA" string, disconnected from pack_size_pricing.
  const minPrice = (pricingRows ?? []).reduce(
    (min, row) => Math.min(min, Number(row.price)),
    Infinity
  );
  const startingPrice = Number.isFinite(minPrice) ? minPrice : null;

  return (
    <div className="bg-white min-h-screen">
      {/* ── Header — same hand-written title component as /creez-votre-box ── */}
      <div className="border-b border-zinc-100 bg-zinc-50/60">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8">
          <HandWrittenTitle
            title={t("title")}
            subtitle={
              locale === "fr"
                ? "Nos boxes ont été soigneusement composées pour vous offrir une expérience parfumée inoubliable."
                : "تم تصميم مجموعاتنا بعناية لتقديم تجربة عطرية لا تُنسى."
            }
          />
        </div>
      </div>

      <BoxesBrowser packs={packs} perfumeImages={perfumeImages} startingPrice={startingPrice} />
    </div>
  );
}
