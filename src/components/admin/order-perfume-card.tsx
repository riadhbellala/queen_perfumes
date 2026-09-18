import { ShoppingBag } from "lucide-react";

export type OrderCardPerfume = {
  id: string;
  name_fr: string;
  description_fr: string | null;
  image_url: string | null;
  scent_family: string | null;
  concentration: string | null;
};

// Same visual pattern as the storefront's order-review-cards.tsx — a big
// photo, name, badges, full description, always visible — just admin-only
// and plain French (no next-intl needed here).
export function OrderPerfumeCard({ perfume }: { perfume: OrderCardPerfume }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row">
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-zinc-50 sm:w-32">
        {perfume.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={perfume.image_url} alt={perfume.name_fr} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <ShoppingBag size={24} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-900">{perfume.name_fr}</p>
        <div className="my-2 flex flex-wrap gap-2">
          {perfume.scent_family && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {perfume.scent_family}
            </span>
          )}
          {perfume.concentration && (
            <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {perfume.concentration}
            </span>
          )}
        </div>
        {perfume.description_fr && (
          <p className="text-sm leading-relaxed text-zinc-500">{perfume.description_fr}</p>
        )}
      </div>
    </div>
  );
}
