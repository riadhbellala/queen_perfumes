"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shop/price";
import { CheckCircle2 } from "lucide-react";

type LastOrder = {
  orderId: string;
  fullName: string;
  itemCount: number;
  total: number;
  createdAt: number;
};

export default function CommandeConfirmationPage() {
  const locale = useLocale();
  const t = useTranslations("OrderConfirmation");
  const tCheckout = useTranslations("Checkout");
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("tqp_last_order");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
      if (stored) setOrder(JSON.parse(stored));
    } catch {
      // ignore
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return <div className="min-h-screen bg-zinc-50/50" />;
  }

  return (
    <div className="bg-zinc-50/50 min-h-screen py-24 px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-10 text-center shadow-xl border border-zinc-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-heading font-bold text-zinc-900 mb-4">{t("title")}</h1>
        <p className="text-zinc-500 mb-8">{t("desc")}</p>

        {order && (
          <div className="bg-zinc-50 rounded-2xl p-6 mb-8 text-start">
            <div className="flex items-center justify-between py-2 border-b border-zinc-100 gap-4">
              <span className="text-sm text-zinc-500 shrink-0">{t("orderRef")}</span>
              <bdi dir="ltr" className="font-mono text-sm font-semibold text-zinc-900 truncate">
                {order.orderId}
              </bdi>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-100">
              <span className="text-sm text-zinc-500">{t("itemsCount", { count: order.itemCount })}</span>
              <span className="font-medium text-zinc-900">{order.fullName}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-zinc-500">{tCheckout("total")}</span>
              <Price amount={order.total} className="font-bold text-lg text-zinc-900" />
            </div>
          </div>
        )}

        <Link href={`/${locale}`}>
          <Button size="lg" className="rounded-full px-8 bg-zinc-900 text-white hover:bg-zinc-800">
            {t("backHomeCta")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
