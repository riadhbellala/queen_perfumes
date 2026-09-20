"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { lineImage, lineUnitPrice } from "@/lib/cart-line";
import { Price } from "@/components/shop/price";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/shop/page-skeleton";
import { Minus, Plus, ShoppingBag, Trash2, PackageOpen } from "lucide-react";
import type { CartItem } from "@/types";

type Locale = "fr" | "ar";

function lineTitle(item: CartItem, locale: Locale, t: ReturnType<typeof useTranslations>) {
  if (item.type === "custom_pack") return t("PackBuilder.customPackLabel", { count: item.size });
  return item.name[locale];
}

export default function PanierPage() {
  const { items, isHydrated, subtotal, updateQuantity, removeItem } = useCart();
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const tPanier = useTranslations("Panier");

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <PageSkeleton rows={4} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-zinc-400">
          <PackageOpen size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-semibold text-zinc-900 mb-2">
            {t("Checkout.emptyCartTitle")}
          </h1>
          <p className="text-zinc-500 max-w-sm">{t("Checkout.emptyCartDesc")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href={`/${locale}/boxes`}>
            <Button size="lg" className="rounded-full px-8">
              {t("Checkout.emptyCartCta")}
            </Button>
          </Link>
          <Link href={`/${locale}/creez-votre-box`}>
            <Button size="lg" variant="outline" className="rounded-full px-8">
              {t("Navigation.buildYourPack")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-24">
      <div className="bg-background border-b border-border">
        <div className="max-w-5xl mx-auto w-full px-6 lg:px-8 py-10 flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-zinc-900">
            {tPanier("title")}
          </h1>
          <Link
            href={`/${locale}/boxes`}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {tPanier("continueShopping")}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 flex flex-col gap-4">
          {items.map((item) => {
            const unit = lineUnitPrice(item);
            const title = lineTitle(item, locale, t);
            return (
              <div
                key={item.cartLineId}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm"
              >
                <div className="flex min-w-[180px] flex-1 items-center gap-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {lineImage(item) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={lineImage(item)} alt={title} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-300">
                        <ShoppingBag size={22} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 truncate">{title}</p>
                    <Price amount={unit} className="text-sm text-zinc-500" />
                  </div>
                </div>

                <div className="ms-auto flex shrink-0 items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 border border-border rounded-full px-1 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartLineId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-30"
                      aria-label="-"
                    >
                      <Minus size={14} />
                    </button>
                    <bdi dir="ltr" className="inline-block w-6 text-center text-sm font-medium">{item.quantity}</bdi>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartLineId, item.quantity + 1)}
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                      aria-label="+"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <Price
                    amount={unit * item.quantity}
                    className="w-16 sm:w-24 shrink-0 text-end font-semibold text-zinc-900"
                  />

                  <button
                    type="button"
                    onClick={() => removeItem(item.cartLineId)}
                    className="shrink-0 p-2 text-zinc-400 hover:text-red-600 transition-colors"
                    aria-label={tPanier("remove")}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4 bg-card rounded-3xl border border-border shadow-sm p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500">{t("Checkout.subtotal")}</span>
            <Price amount={subtotal} className="font-semibold text-zinc-900" />
          </div>
          <Link href={`/${locale}/commande`}>
            <Button size="lg" className="w-full h-14 rounded-full font-semibold text-lg">
              {tPanier("checkoutCta")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
