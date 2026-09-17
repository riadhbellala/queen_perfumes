import { CartItem } from "@/types";
import { PLACEHOLDER_PERFUMES } from "@/lib/placeholder-data";

export function lineUnitPrice(item: CartItem): number {
  return item.type === "perfume" ? item.unitPrice : item.price;
}

export function lineImage(item: CartItem): string | undefined {
  if (item.type === "custom_pack") {
    const firstPerfume = PLACEHOLDER_PERFUMES.find((p) => item.selectedPerfumeIds.includes(p.id));
    return firstPerfume?.imageUrl;
  }
  return item.imageUrl;
}
