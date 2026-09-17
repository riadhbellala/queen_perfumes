"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Perfume } from "@/types";
import { toCartPerfumeSummary } from "@/lib/cart-line";
import { Minus, Plus } from "lucide-react";

export function PerfumeAddToCart({ perfume }: { perfume: Perfume }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();
  const locale = useLocale() as "fr" | "ar";
  const t = useTranslations("Product");

  const isUnavailable = !perfume.inStock;

  function handleAdd() {
    if (isUnavailable || perfume.price === undefined) return;
    addItem({
      type: "perfume",
      perfumeId: perfume.id,
      name: perfume.name,
      imageUrl: perfume.imageUrl,
      unitPrice: perfume.price,
      quantity,
      perfume: toCartPerfumeSummary(perfume),
    });
    router.push(`/${locale}/panier`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-10">
      <div className="flex items-center border rounded-md h-12 w-full sm:w-32">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-4 py-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          aria-label="-"
        >
          <Minus size={14} />
        </button>
        <bdi dir="ltr" className="flex-1 text-center font-medium">{quantity}</bdi>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="px-4 py-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          aria-label="+"
        >
          <Plus size={14} />
        </button>
      </div>
      <Button
        size="lg"
        onClick={handleAdd}
        disabled={isUnavailable}
        className="h-12 flex-1 text-base rounded-md"
      >
        {isUnavailable ? t("outOfStock") : t("addToCart")}
      </Button>
    </div>
  );
}
