import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { mapPackRow } from "@/lib/supabase/mappers";
import { BoxesBrowser } from "@/components/shop/boxes-browser";

export default async function BoxesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Packs");

  const supabase = await createClient();
  const [{ data: packRows }, { data: perfumeRows }] = await Promise.all([
    supabase
      .from("packs")
      .select("*, pack_perfumes(perfume_id)")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase.from("perfumes").select("id, image_url"),
  ]);

  const packs = (packRows ?? []).map((row) =>
    mapPackRow(row, (row.pack_perfumes ?? []).map((pp: { perfume_id: string }) => pp.perfume_id))
  );
  const perfumeImages: Record<string, string | undefined> = {};
  for (const row of perfumeRows ?? []) {
    perfumeImages[row.id] = row.image_url ?? undefined;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ── Header ── */}
      <div className="border-b border-zinc-100 bg-zinc-50/60">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-zinc-900 mb-4">
            {t("title")}
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto text-base">
            {locale === "fr"
              ? "Nos boxes ont été soigneusement composées pour vous offrir une expérience parfumée inoubliable."
              : "تم تصميم مجموعاتنا بعناية لتقديم تجربة عطرية لا تُنسى."}
          </p>
        </div>
      </div>

      <BoxesBrowser packs={packs} perfumeImages={perfumeImages} />
    </div>
  );
}
