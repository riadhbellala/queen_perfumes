import { getTranslations } from "next-intl/server";
import { supabasePublic } from "@/lib/supabase/public";
import { mapPerfumeRow } from "@/lib/supabase/mappers";
import { PerfumesBrowser } from "@/components/shop/perfumes-browser";

export const revalidate = 60;

export default async function PerfumesPage() {
  const t = await getTranslations("Perfumes");

  const supabase = supabasePublic;
  const { data: perfumeRows } = await supabase
    .from("perfumes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const perfumes = (perfumeRows ?? []).map(mapPerfumeRow);

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border bg-secondary/60">
        <div className="mx-auto w-full max-w-7xl px-6 py-14 text-center lg:px-8 md:py-16">
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <PerfumesBrowser perfumes={perfumes} />
    </div>
  );
}
