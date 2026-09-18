import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { supabasePublic } from "@/lib/supabase/public";
import { mapPackRow, mapPerfumeRow } from "@/lib/supabase/mappers";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shop/price";
import { BoxAddToCart } from "@/components/shop/box-add-to-cart";
import Link from "next/link";

export const revalidate = 60;

export default async function BoxDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = supabasePublic;

  const { data: packRow } = await supabase
    .from("packs")
    .select("*, pack_perfumes(perfume_id)")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!packRow) {
    notFound();
  }

  const perfumeIds: string[] = (packRow.pack_perfumes ?? []).map(
    (pp: { perfume_id: string }) => pp.perfume_id
  );
  const pack = mapPackRow(packRow, perfumeIds);

  const tPack = await getTranslations("Pack");
  const tProduct = await getTranslations("Product");
  const loc = locale as "fr" | "ar";

  // Resolve perfumes in this pack, preserving the pack's own ordering
  const { data: perfumeRows } = perfumeIds.length
    ? await supabase.from("perfumes").select("*").in("id", perfumeIds)
    : { data: [] };
  const perfumesById = new Map((perfumeRows ?? []).map((row) => [row.id, mapPerfumeRow(row)]));
  const packPerfumes = perfumeIds
    .map((perfumeId) => perfumesById.get(perfumeId))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          href={`/${locale}/boxes`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {tPack("backToPacks")}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-24">
        {/* Left: Image */}
        <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
          {pack.imageUrl ? (
            <img
              src={pack.imageUrl}
              alt={pack.name[loc]}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="96"
                height="96"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <path d="M7 3v18" />
                <path d="M17 3v18" />
                <path d="M3 10h18" />
                <path d="M3 14h18" />
              </svg>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-display font-semibold tracking-tight text-zinc-900 mb-6">
            {pack.name[loc]}
          </h1>

          <Price amount={pack.price} className="text-3xl font-medium text-zinc-900 mb-6" />

          <p className="text-lg text-zinc-600 mb-10 leading-relaxed">
            {pack.description[loc]}
          </p>

          <BoxAddToCart pack={pack} perfumes={packPerfumes} />

          <div className="text-sm text-zinc-500 space-y-2 pt-6 border-t border-border">
            <p>{tProduct("freeDelivery")}</p>
            <p>{tProduct("freeReturns")}</p>
          </div>
        </div>
      </div>

      {/* Cette box contient */}
      <section>
        <h2 className="text-2xl font-display font-semibold tracking-tight text-zinc-900 mb-8">
          {tPack("contains")}
        </h2>
        <div className="flex flex-col gap-6">
          {packPerfumes.map((perfume) => (
            <div
              key={perfume.id}
              className="flex flex-col sm:flex-row gap-6 p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Small image placeholder */}
              <Link
                href={`/${locale}/parfums/${perfume.id}`}
                className="shrink-0 w-full sm:w-48 aspect-square sm:aspect-[4/3] bg-muted rounded-lg flex items-center justify-center overflow-hidden"
              >
                {perfume.imageUrl ? (
                  <img
                    src={perfume.imageUrl}
                    alt={perfume.name[loc]}
                    loading="lazy"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                )}
              </Link>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <Link
                    href={`/${locale}/parfums/${perfume.id}`}
                    className="hover:underline underline-offset-4 decoration-1"
                  >
                    <h3 className="text-xl font-display font-semibold text-zinc-900">
                      {perfume.name[loc]}
                    </h3>
                  </Link>
                  {!perfume.inStock && (
                    <span className="text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded shrink-0">
                      {tProduct("outOfStock")}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary" className="font-normal text-xs">
                    {perfume.scentFamily}
                  </Badge>
                  <Badge variant="outline" className="font-normal text-xs">
                    {perfume.concentration}
                  </Badge>
                </div>

                <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
                  {perfume.description[loc]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


