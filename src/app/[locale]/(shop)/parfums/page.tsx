import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { mapPerfumeRow } from "@/lib/supabase/mappers";
import { PerfumesBrowser } from "@/components/shop/perfumes-browser";

export default async function PerfumesPage() {
  const t = await getTranslations("Perfumes");

  const supabase = await createClient();
  const { data: perfumeRows } = await supabase
    .from("perfumes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const perfumes = (perfumeRows ?? []).map(mapPerfumeRow);

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border bg-secondary/60">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-zinc-900">
            {t("title")}
          </h1>
        </div>
      </div>

      <PerfumesBrowser perfumes={perfumes} />
    </div>
  );
}
