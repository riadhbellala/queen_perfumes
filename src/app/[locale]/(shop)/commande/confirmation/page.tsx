"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shop/price";
import { PageSkeleton } from "@/components/shop/page-skeleton";
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
    return (
      <div className="min-h-screen bg-background">
        <PageSkeleton rows={2} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-20 lg:px-8 md:py-24">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm md:p-10">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 size={40} strokeWidth={1.75} />
        </div>
        <h1 className="mb-4 font-display text-3xl font-medium text-foreground">{t("title")}</h1>
        <p className="mb-8 text-muted-foreground">{t("desc")}</p>

        {order && (
          <div className="mb-8 rounded-2xl bg-secondary p-6 text-start">
            <div className="flex items-center justify-between gap-4 border-b border-foreground/10 py-2.5">
              <span className="shrink-0 text-sm text-muted-foreground">{t("orderRef")}</span>
              <bdi dir="ltr" className="truncate font-mono text-sm font-semibold text-foreground">
                {order.orderId}
              </bdi>
            </div>
            <div className="flex items-center justify-between border-b border-foreground/10 py-2.5">
              <span className="text-sm text-muted-foreground">{t("itemsCount", { count: order.itemCount })}</span>
              <span className="font-medium text-foreground">{order.fullName}</span>
            </div>
            <div className="flex items-center justify-between pt-2.5">
              <span className="text-sm text-muted-foreground">{tCheckout("total")}</span>
              <Price amount={order.total} className="text-lg font-bold text-foreground" />
            </div>
          </div>
        )}

        <Link href={`/${locale}`}>
          <Button size="lg" className="rounded-full px-8">
            {t("backHomeCta")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
