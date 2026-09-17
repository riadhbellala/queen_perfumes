"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { OrderReviewCards } from "@/components/shop/order-review-cards";
import { DeliveryForm } from "@/components/shop/delivery-form";
import { Button } from "@/components/ui/button";
import { PackageOpen, ChevronRight } from "lucide-react";

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

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="bg-zinc-50/50 min-h-screen pb-24">
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-6xl mx-auto w-full px-6 lg:px-8 py-10">
          {/* Checkout breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300 mb-4">
            <span className="text-zinc-900">{locale === "fr" ? "Panier" : "السلة"}</span>
            <ChevronRight size={12} className={locale === "ar" ? "rotate-180" : ""} />
            <span className="text-zinc-900">{locale === "fr" ? "Livraison" : "التوصيل"}</span>
            <ChevronRight size={12} className={locale === "ar" ? "rotate-180" : ""} />
            <span>{locale === "fr" ? "Confirmation" : "التأكيد"}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-zinc-900">
            {t("title")}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-5 lg:sticky lg:top-24 bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8">
          <div className="flex items-baseline gap-3 mb-8">
            <span className="font-sans text-3xl text-zinc-200">
              <bdi dir="ltr">01</bdi>
            </span>
            <h2 className="text-2xl font-heading font-medium text-zinc-900">
              {t("deliveryInfo")}
            </h2>
          </div>
          <DeliveryForm />
        </section>

        <section className="lg:col-span-7 bg-[#FAF7F2] rounded-3xl border border-[#EDE6D8] shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 pb-5 md:pb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-sans text-3xl text-[#c9b99a]">
                <bdi dir="ltr">02</bdi>
              </span>
              <h2 className="text-2xl font-heading font-medium text-zinc-900">
                {t("orderReviewTitle")}
              </h2>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              <bdi dir="ltr">{itemCount}</bdi>{" "}
              {locale === "fr" ? (itemCount > 1 ? "articles" : "article") : "منتجات"}
            </p>
          </div>
          <div className="border-t border-dashed border-[#DED4BF] mx-6 md:mx-8" />
          <div className="p-6 md:p-8 pt-5 md:pt-6">
            <OrderReviewCards items={items} />
          </div>
        </section>
      </div>
    </div>
  );
}
