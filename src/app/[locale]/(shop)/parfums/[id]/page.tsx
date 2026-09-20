import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { supabasePublic } from "@/lib/supabase/public";
import { mapPerfumeRow } from "@/lib/supabase/mappers";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shop/price";
import { PerfumeAddToCart } from "@/components/shop/perfume-add-to-cart";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

export default async function PerfumeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = supabasePublic;

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
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8 md:py-14">
      <div className="mb-8">
        <Link
          href={`/${locale}/parfums`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} className={loc === "ar" ? "rotate-180" : ""} />
          {tPerfumes("backToPerfumes")}
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:gap-20">
        {/* Image — portrait ratio matches catalog cards */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
          {perfume.imageUrl ? (
            <img
              src={perfume.imageUrl}
              alt={perfume.name[loc]}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
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
            <div className="absolute end-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-destructive shadow-sm ring-1 ring-border backdrop-blur-sm">
              {tProduct("outOfStockBadge")}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center md:py-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {perfume.scentFamily} · {perfume.concentration}
          </p>

          <h1 className="mb-6 font-display text-4xl font-medium tracking-tight text-foreground lg:text-5xl">
            {perfume.name[loc]}
          </h1>

          <div className="mb-6 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs font-normal">
              {perfume.scentFamily}
            </Badge>
            <Badge variant="outline" className="text-xs font-normal">
              {perfume.concentration}
            </Badge>
            {perfume.inStock ? (
              <Badge className="border-transparent bg-primary/10 text-xs font-normal text-primary">
                {tProduct("inStock")}
              </Badge>
            ) : null}
          </div>

          {perfume.price !== undefined && (
            <Price amount={perfume.price} className="mb-8 text-3xl font-medium text-foreground" />
          )}

          <p className="mb-10 max-w-prose text-base leading-relaxed text-muted-foreground md:text-lg">
            {perfume.description[loc]}
          </p>

          <PerfumeAddToCart perfume={perfume} />

          <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
            <p>{tProduct("freeDelivery")}</p>
            <p>{tProduct("freeReturns")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
