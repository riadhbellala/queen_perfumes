"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import Autoplay from "embla-carousel-autoplay";
import type { Pack } from "@/types";
import { ProductCard } from "@/components/shop/product-card";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

const AUTOPLAY_DELAY_MS = 4500;

// Below this count there isn't enough content to justify a carousel at all
// (nothing to scroll to) — shown as a plain centered/even row instead. Once
// past it, the carousel is always active, on every viewport, up to desktop.
const NO_CAROUSEL_MAX = 2;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Sync initial state from the media query on mount — there's no earlier
    // render to have derived this from (and reading matchMedia during render
    // itself wouldn't be SSR-safe).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// Only ever used for 1-2 boxes — a plain row, evenly sized, no carousel
// machinery. A lone box still gets a width cap so it doesn't stretch edge
// to edge.
function EvenBoxesRow({ packs }: { packs: Pack[] }) {
  const desktopCols = packs.length <= 1 ? "md:grid-cols-1 md:max-w-sm" : "md:grid-cols-2 md:max-w-2xl";

  return (
    <div className={`flex flex-wrap justify-center gap-6 md:mx-auto md:grid md:gap-8 ${desktopCols}`}>
      {packs.map((pack) => (
        <div key={pack.id} className="w-full max-w-64 sm:w-64 md:w-auto">
          <ProductCard product={pack} type="pack" />
        </div>
      ))}
    </div>
  );
}

// Homepage "Recommended Boxes" section. 1-2 boxes → a plain row, nothing to
// scroll. 3+ → a real, always-on embla carousel: 2 cards per view on
// mobile (swipeable), 3 large cards per view on desktop (~90% of the page
// width via the wrapper in (shop)/page.tsx), with autoplay + arrows.
export function BoxesCarousel({ packs }: { packs: Pack[] }) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const reducedMotion = usePrefersReducedMotion();
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onChange = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    onChange();
    api.on("select", onChange);
    api.on("reInit", onChange);
    return () => {
      api.off("select", onChange);
    };
  }, [api]);

  const plugins = useMemo(() => {
    if (reducedMotion || packs.length < 3) return [];
    return [
      Autoplay({
        delay: AUTOPLAY_DELAY_MS,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ];
  }, [reducedMotion, packs.length]);

  if (packs.length === 0) return null;

  if (packs.length <= NO_CAROUSEL_MAX) {
    return <EvenBoxesRow packs={packs} />;
  }

  const showNav = canScrollPrev || canScrollNext;

  return (
    <div className="relative">
      <Carousel
        setApi={setApi}
        // `direction` (not just the page's CSS `dir`) is what makes embla's
        // own drag/scroll math RTL-correct — without it, swiping right in
        // Arabic would advance to the previous slide instead of the next one.
        opts={{ align: "start", direction: isRtl ? "rtl" : "ltr", loop: true }}
        plugins={plugins}
        className="w-full"
      >
        <CarouselContent className="-ml-5">
          {packs.map((pack) => (
            <CarouselItem key={pack.id} className="basis-1/2 pl-5 md:basis-1/3">
              <ProductCard product={pack} type="pack" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {showNav && (
        <>
          <button
            type="button"
            aria-label={locale === "fr" ? "Précédent" : "السابق"}
            onClick={() => api?.scrollPrev()}
            className="absolute start-1 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground sm:flex"
          >
            {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            type="button"
            aria-label={locale === "fr" ? "Suivant" : "التالي"}
            onClick={() => api?.scrollNext()}
            className="absolute end-1 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground sm:flex"
          >
            {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </>
      )}
    </div>
  );
}
