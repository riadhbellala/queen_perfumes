import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { mapPerfumeRow } from "@/lib/supabase/mappers";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shop/price";
import { PerfumeAddToCart } from "@/components/shop/perfume-add-to-cart";
import Link from "next/link";

export default async function PerfumeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const { data: perfumeRow } = await supabase
    .from("perfumes")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!perfumeRow) {
    notFound();
  }

  const perfume = mapPerfumeRow(perfumeRow);
  const tPerfumes = await getTranslations("Perfumes");
  const tProduct = await getTranslations("Product");
  const loc = locale as "fr" | "ar";

  return (
    <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          href={`/${locale}/parfums`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {tPerfumes("backToPerfumes")}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Left: Image */}
        <div className="aspect-square bg-zinc-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
          {perfume.imageUrl ? (
            <img
              src={perfume.imageUrl}
              alt={perfume.name[loc]}
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
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
          {!perfume.inStock && (
            <div className="absolute top-4 end-4 bg-white/90 backdrop-blur text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              {tProduct("outOfStockBadge")}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-900 mb-6">
            {perfume.name[loc]}
          </h1>

          <div className="flex gap-2 mb-6">
            <Badge variant="secondary" className="font-normal text-xs">
              {perfume.scentFamily}
            </Badge>
            <Badge variant="outline" className="font-normal text-xs">
              {perfume.concentration}
            </Badge>
          </div>

          {perfume.price !== undefined && (
            <Price amount={perfume.price} className="text-3xl font-medium text-zinc-900 mb-6" />
          )}

          <p className="text-lg text-zinc-600 mb-10 leading-relaxed">
            {perfume.description[loc]}
          </p>

          <PerfumeAddToCart perfume={perfume} />

          <div className="text-sm text-zinc-500 space-y-2 pt-6 border-t border-zinc-100">
            <p>{tProduct("freeDelivery")}</p>
            <p>{tProduct("freeReturns")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
