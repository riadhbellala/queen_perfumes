import { getTranslations } from "next-intl/server";
import { supabasePublic } from "@/lib/supabase/public";
import { mapPackRow } from "@/lib/supabase/mappers";
import { BoxesBrowser } from "@/components/shop/boxes-browser";

export const revalidate = 60;

export default async function BoxesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Packs");

  const supabase = supabasePublic;
  const [{ data: packRows }, { data: pricingRows }] = await Promise.all([
    supabase
      .from("packs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase.from("pack_size_pricing").select("price"),
  ]);

  const packs = (packRows ?? []).map((row) => mapPackRow(row));
  // Drives the CTA banner's "starting at X DA" line — was previously a
  // hardcoded "1 900 DA" string, disconnected from pack_size_pricing.
  const minPrice = (pricingRows ?? []).reduce(
    (min, row) => Math.min(min, Number(row.price)),
    Infinity
  );
  const startingPrice = Number.isFinite(minPrice) ? minPrice : null;

  return (
    <div className="bg-background min-h-screen">
      {/* ── Hero — real product photo, dark overlay for legible white text ── */}
      <div className="relative flex min-h-[38vh] w-full items-center justify-center overflow-hidden bg-[url('/assets/herosection/boxes-hero.webp')] bg-cover bg-center px-6 py-16 md:min-h-[48vh]">
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 max-w-2xl text-center">
          <h1 className="font-display text-5xl tracking-tight text-white drop-shadow-md md:text-6xl">
            {t("title")}
          </h1>
          <div className="mx-auto mt-5 h-px w-14 bg-white/40" />
          <p className="mt-5 text-base text-white/85 md:text-lg">
            {locale === "fr"
              ? "Nos boxes ont été soigneusement composées pour vous offrir une expérience parfumée inoubliable."
              : "تم تصميم مجموعاتنا بعناية لتقديم تجربة عطرية لا تُنسى."}
          </p>
        </div>
      </div>

      <BoxesBrowser packs={packs} startingPrice={startingPrice} />
    </div>
  );
}
