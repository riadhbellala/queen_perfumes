import React from "react";
import Link from "next/link";
import { Perfume, Pack } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shop/price";
import { useLocale, useTranslations } from "next-intl";

interface ProductCardProps {
  product: Perfume | Pack;
  type: "perfume" | "pack";
  /** Optional small subtitle/meta line shown below the title (e.g. "4 parfums") */
  meta?: string;
  /** Optional badge label overlaid on the image corner (e.g. "Box") */
  badgeLabel?: string;
}

export function ProductCard({ product, type, meta, badgeLabel }: ProductCardProps) {
  const locale = useLocale() as 'fr' | 'ar';
  const t = useTranslations('Product');
  const isPerfume = type === "perfume";
  const perfume = isPerfume ? (product as Perfume) : null;
  const href = `/${locale}${isPerfume ? `/parfums/${product.id}` : `/boxes/${product.id}`}`;

  return (
    <Link href={href} className="group block overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-[4/5] bg-zinc-50 flex items-center justify-center relative overflow-hidden">
        {/* Placeholder image */}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name[locale]} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-zinc-50 flex items-center justify-center text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
        
        {perfume && !perfume.inStock && (
          <div className="absolute top-3 end-3 bg-white/90 backdrop-blur text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            {t('outOfStockBadge')}
          </div>
        )}
        {badgeLabel && (
          <div className="absolute top-3 start-3 bg-black/80 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            {badgeLabel}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col gap-3">
        <h3 className="font-heading text-xl font-medium leading-tight text-zinc-900 group-hover:text-zinc-600 transition-colors">{product.name[locale]}</h3>
        
        {meta && (
          <p className="text-sm text-zinc-500">{meta}</p>
        )}

        {isPerfume && perfume && (
          <div className="flex gap-2">
            <Badge variant="secondary" className="font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs rounded-full px-3 py-0.5">{perfume.scentFamily}</Badge>
            <Badge variant="outline" className="font-medium border-zinc-200 text-zinc-600 text-xs rounded-full px-3 py-0.5">{perfume.concentration}</Badge>
          </div>
        )}
        
        {!isPerfume && !meta && (
          <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{product.description[locale]}</p>
        )}
        
        {product.price !== undefined && (
          <div className="mt-1 flex items-center justify-between">
            <Price amount={product.price} className="text-lg font-semibold text-zinc-900" />
            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors uppercase tracking-wider">{isPerfume ? t('composeCTA') : t('addToCart')}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
