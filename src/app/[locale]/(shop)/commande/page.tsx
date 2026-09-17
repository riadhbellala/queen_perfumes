"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { OrderReviewAccordion } from "@/components/shop/order-review-accordion";
import { DeliveryForm } from "@/components/shop/delivery-form";
import { Button } from "@/components/ui/button";
import { PackageOpen } from "lucide-react";

export default function CommandePage() {
  const { items, isHydrated } = useCart();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Checkout");

  useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.replace(`/${locale}/panier`);
    }
  }, [isHydrated, items.length, locale, router]);

  if (!isHydrated) {
    return <div className="min-h-screen bg-zinc-50/50" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
          <PackageOpen size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-semibold text-zinc-900 mb-2">
            {t("emptyCartTitle")}
          </h1>
          <p className="text-zinc-500 max-w-sm">{t("emptyCartDesc")}</p>
        </div>
        <Link href={`/${locale}/boxes`}>
          <Button size="lg" className="rounded-full px-8">
            {t("emptyCartCta")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50/50 min-h-screen pb-24">
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-6xl mx-auto w-full px-6 lg:px-8 py-10">
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-zinc-900">
            {t("title")}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-heading font-medium text-zinc-900 mb-6">
            {t("orderReviewTitle")}
          </h2>
          <OrderReviewAccordion items={items} />
        </section>

        <section className="lg:col-span-5 lg:sticky lg:top-24 bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-heading font-medium text-zinc-900 mb-8">
            {t("deliveryInfo")}
          </h2>
          <DeliveryForm />
        </section>
      </div>
    </div>
  );
}
