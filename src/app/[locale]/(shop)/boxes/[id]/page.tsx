import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { supabasePublic } from "@/lib/supabase/public";
import { mapPackRow, mapPerfumeRow } from "@/lib/supabase/mappers";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shop/price";
import { BoxAddToCart } from "@/components/shop/box-add-to-cart";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

  const { data: perfumeRows } = perfumeIds.length
    ? await supabase.from("perfumes").select("*").in("id", perfumeIds)
    : { data: [] };
  const perfumesById = new Map((perfumeRows ?? []).map((row) => [row.id, mapPerfumeRow(row)]));
  const packPerfumes = perfumeIds
    .map((perfumeId) => perfumesById.get(perfumeId))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8 md:py-14">
      <div className="mb-8">
        <Link
          href={`/${locale}/boxes`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} className={loc === "ar" ? "rotate-180" : ""} />
          {tPack("backToPacks")}
        </Link>
      </div>

      <div className="mb-20 grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:mb-24 lg:gap-20">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
          {pack.imageUrl ? (
            <img
              src={pack.imageUrl}
              alt={pack.name[loc]}
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
                <path d="M7 3v18" />
                <path d="M17 3v18" />
                <path d="M3 10h18" />
                <path d="M3 14h18" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center md:py-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
            {tProduct("boxBadge")}
          </p>

          <h1 className="mb-6 font-display text-4xl font-medium tracking-tight text-foreground lg:text-5xl">
            {pack.name[loc]}
          </h1>

          <Price amount={pack.price} className="mb-8 text-3xl font-medium text-foreground" />

          <p className="mb-10 max-w-prose text-base leading-relaxed text-muted-foreground md:text-lg">
            {pack.description[loc]}
          </p>

          <BoxAddToCart pack={pack} perfumes={packPerfumes} />

          <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
            <p>{tProduct("freeDelivery")}</p>
            <p>{tProduct("freeReturns")}</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-8 font-display text-2xl font-medium tracking-tight text-foreground">
          {tPack("contains")}
        </h2>
        <div className="stagger-fade flex flex-col gap-5">
          {packPerfumes.map((perfume) => (
            <article
              key={perfume.id}
              className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 transition-shadow duration-200 hover:shadow-sm sm:flex-row sm:p-6"
            >
              <Link
                href={`/${locale}/parfums/${perfume.id}`}
                className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border sm:w-36"
              >
                {perfume.imageUrl ? (
                  <img
                    src={perfume.imageUrl}
                    alt={perfume.name[loc]}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
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

              <div className="flex flex-1 flex-col justify-center">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <Link
                    href={`/${locale}/parfums/${perfume.id}`}
                    className="underline-offset-4 decoration-accent/40 hover:underline"
                  >
                    <h3 className="font-display text-xl font-medium text-foreground">
                      {perfume.name[loc]}
                    </h3>
                  </Link>
                  {!perfume.inStock && (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                      {tProduct("outOfStock")}
                    </span>
                  )}
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {perfume.scentFamily}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal">
                    {perfume.concentration}
                  </Badge>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {perfume.description[loc]}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
