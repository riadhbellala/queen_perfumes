"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Pack } from "@/types";
import { Minus, Plus } from "lucide-react";

export function PackAddToCart({ pack }: { pack: Pack }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();
  const locale = useLocale() as "fr" | "ar";
  const t = useTranslations("Product");

  function handleAdd() {
    addItem({
      type: "pack",
      packId: pack.id,
      name: pack.name,
      imageUrl: pack.imageUrl,
      price: pack.price,
      quantity,
      perfumeIds: pack.perfumeIds,
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
        <span className="flex-1 text-center font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="px-4 py-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          aria-label="+"
        >
          <Plus size={14} />
        </button>
      </div>
      <Button size="lg" onClick={handleAdd} className="h-12 flex-1 text-base rounded-md">
        {t("addToCart")}
      </Button>
    </div>
  );
}
