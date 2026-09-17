import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PLACEHOLDER_PACKS, PLACEHOLDER_PERFUMES, PACK_SIZE_PRICING } from "@/lib/placeholder-data";
import { ProductCard } from "@/components/shop/product-card";
import { HomepagePackBuilder } from "@/components/shop/homepage-pack-builder";
import { Price } from "@/components/shop/price";
import { Button } from "@/components/ui/button";

export default async function ShopHomepage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tHome = await getTranslations("Home");
  const tHero = await getTranslations("Hero");
  const tPackBuilder = await getTranslations("PackBuilder");
  const recommendedPacks = PLACEHOLDER_PACKS.slice(0, 4);
  const recommendedPerfumes = PLACEHOLDER_PERFUMES.slice(0, 8); // Showing more perfumes

  const startingPrice = PACK_SIZE_PRICING[0].price;

  const InstagramIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );

  const TikTokIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}>
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
    </svg>
  );




  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Hero section */}
      <section className="min-h-[45vh] md:min-h-[55vh] w-full bg-[url('/assets/herosection/tbq.webp')] bg-cover bg-center flex flex-col items-center justify-center text-center px-6 relative py-12">
        {/* Darker overlay so text is readable */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Pricing caption — a single-line pill, matching the badge style used elsewhere (e.g. /boxes hero) */}
        <div className="hidden md:inline-flex absolute start-8 lg:start-14 bottom-10 z-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
          <Price amount={startingPrice} className="text-base font-semibold text-white" />
          <span className="text-white/40">·</span>
          <span className="text-sm text-white/70">
            {locale === "fr" ? "pour 2 parfums" : "لعطرين"}
          </span>
        </div>

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
            {/* Creative CTA Button with a static soft glow (no infinite animation) */}
            <Link href={`/${locale}/creez-votre-box`} className="group relative inline-flex items-center justify-center mt-2">
              <div className="absolute -inset-1 bg-white/30 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-[pulse_3s_ease-in-out_infinite]"></div>
              <Button size="lg" className="relative h-12 md:h-14 px-10 md:px-12 text-base md:text-lg font-heading tracking-wide rounded-full bg-white/95 text-zinc-900 hover:bg-white shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50">
                {tHero("cta")}
              </Button>
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
      <div className="marquee-wrapper bg-[#E8E2D6] text-[#5c4a3d] border-b border-[#D6CFC0] py-3 text-sm font-medium tracking-wide">
        <div className="marquee-track">
          {/* First half */}
          <div className="marquee-half">
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeClient")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeShipping")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeBrand")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeClient")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeShipping")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeBrand")}</span>
          </div>
          {/* Exact duplicate — enables seamless loop */}
          <div className="marquee-half">
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeClient")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeShipping")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeBrand")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeClient")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeShipping")}</span>
            <span className="inline-flex items-center gap-2 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b]" />{tHome("marqueeBrand")}</span>
          </div>
        </div>
      </div>

      {/* Recommended Packs */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading text-zinc-900 mb-4">{tHome("recommendedPacksTitle")}</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">{tHome("packsSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {recommendedPacks.map(pack => (
            <ProductCard key={pack.id} product={pack} type="pack" />
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link href={`/${locale}/boxes`}>
            <Button variant="outline" size="lg" className="px-10 h-14 text-base font-semibold rounded-full border-zinc-300 hover:bg-zinc-50">
              {tHome("discoverMorePacks")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Pack Builder Section */}
      <section id="pack-builder" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto w-full mb-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading text-zinc-900 mb-4">{tPackBuilder("title")}</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">{tPackBuilder("subtitle")}</p>
        </div>
        
        <HomepagePackBuilder />
      </section>
    </div>
  );
}
