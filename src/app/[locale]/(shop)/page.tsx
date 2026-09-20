import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { supabasePublic } from "@/lib/supabase/public";
import { mapPackRow, mapPerfumeRow, mapPackSizePricingRow } from "@/lib/supabase/mappers";
import { BoxesCarousel } from "@/components/shop/boxes-carousel";
import { HomepageBoxBuilder } from "@/components/shop/homepage-box-builder";
import { InstagramIcon, TikTokIcon } from "@/components/shop/social-icons";
import { FlowButton } from "@/components/ui/flow-button";
import { ArrowRight } from "lucide-react";

// Square, uppercase, hairline-bordered secondary CTA — matches the
// "perfume house" square-corner language the box-builder section (below)
// established, instead of the round animated FlowButton (kept only for the
// hero's own primary CTA on the photo). Used by both catalog-preview
// sections' headers so their CTAs visually match each other, not just the
// section further down the page.
function SectionCta({
  href,
  locale,
  children,
}: {
  href: string;
  locale: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex h-12 shrink-0 items-center gap-2 border border-foreground/25 px-7 text-[12px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
    >
      {children}
      <ArrowRight
        size={14}
        className={`transition-transform group-hover:translate-x-1 ${locale === "ar" ? "rotate-180 group-hover:-translate-x-1" : ""}`}
      />
    </Link>
  );
}

// Catalog data changes rarely (admin edits), so this page is ISR-cached
// instead of hitting Supabase fresh on every visit — see supabase/public.ts
// for why that requires the plain anon client, not the cookie-based one.
export const revalidate = 60;

export default async function ShopHomepage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tHome = await getTranslations("Home");
  const tHero = await getTranslations("Hero");

  const supabase = supabasePublic;
  const [{ data: packRows }, { data: perfumeRows }, { data: pricingRows }] = await Promise.all([
    supabase
      .from("packs")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase.from("perfumes").select("*").eq("is_active", true).order("created_at", { ascending: true }),
    supabase.from("pack_size_pricing").select("size, price").order("size", { ascending: true }),
  ]);

  const allPacks = (packRows ?? []).map((row) => mapPackRow(row));
  const allPerfumes = (perfumeRows ?? []).map(mapPerfumeRow);
  const packSizePricing = (pricingRows ?? []).map(mapPackSizePricingRow);

  const recommendedPacks = allPacks.slice(0, 4);

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Hero section */}
      <section className="min-h-[45vh] md:min-h-[55vh] w-full bg-[url('/assets/herosection/tbq.webp')] bg-cover bg-center flex flex-col items-center justify-center text-center px-6 relative py-12">
        {/* Darker overlay so text is readable */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-2xl">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-heading text-white mb-4 drop-shadow-md">
              {tHero("title")}
            </h1>
            <p className="text-base md:text-lg text-zinc-200 text-balance drop-shadow-sm font-medium">
              {tHero("description")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Link href={`/${locale}/creez-votre-box`} className="mt-2 inline-flex">
              <FlowButton text={tHero("cta")} variant="light" />
            </Link>

            {/* Social Icons with frosted glass effect */}
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-white/30 hidden sm:block"></span>
              <a href="#" className="group bg-white/10 hover:bg-white/30 border border-white/20 p-3 rounded-full text-white backdrop-blur-md transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                <InstagramIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="group bg-white/10 hover:bg-white/30 border border-white/20 p-3 rounded-full text-white backdrop-blur-md transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                <TikTokIcon className="w-4 h-4 md:w-4.5 md:h-4.5 group-hover:scale-110 transition-transform" />
              </a>
              <span className="h-px w-10 bg-white/30 hidden sm:block"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee */}
      <div className="marquee-wrapper bg-secondary text-foreground border-b border-[#D6CFC0] py-3 text-sm font-medium tracking-wide">
        <div className="marquee-track">
          {/* First half */}
          <div className="marquee-half">
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeClient")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeShipping")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeBrand")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeClient")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeShipping")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeBrand")}</span>
          </div>
          {/* Exact duplicate — enables seamless loop */}
          <div className="marquee-half">
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeClient")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeShipping")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeBrand")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeClient")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeShipping")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{tHome("marqueeBrand")}</span>
          </div>
        </div>
      </div>

      {/* Recommended Packs — the carousel itself is full-width (only a
          small side gutter, no max-w-7xl cap) so its big 2-up/3-up cards
          actually span the page; the heading/CTA stay in the usual
          max-w-7xl reading column. */}
      <section className="py-14 md:py-16 w-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-start">
            <div className="min-w-0">
              <h2 className="font-display text-4xl text-foreground md:text-5xl">{tHome("recommendedPacksTitle")}</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:mx-0">{tHome("packsSubtitle")}</p>
            </div>
            <SectionCta href={`/${locale}/boxes`} locale={locale}>
              {tHome("discoverMorePacks")}
            </SectionCta>
          </div>
        </div>
        <div className="mx-auto mt-10 w-[90vw] max-w-[1800px]">
          <BoxesCarousel packs={recommendedPacks} />
        </div>
      </section>

      {/* Pack Builder Section — full-bleed (its own bg-secondary band,
          own padding/heading/subtitle in its left column), flush against
          the section above with no wrapping max-w-7xl/gap: the previous
          wrapper duplicated the component's own "Créez votre box" title
          and constrained its 400px/800px desktop columns to a narrower
          box than they were designed for. */}
      <div id="pack-builder">
        <HomepageBoxBuilder perfumes={allPerfumes} pricing={packSizePricing} />
      </div>
    </div>
  );
}
