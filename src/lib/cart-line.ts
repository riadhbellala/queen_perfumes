import { CartItem, CartPerfumeSummary, Perfume } from "@/types";

export function lineUnitPrice(item: CartItem): number {
  return item.type === "perfume" ? item.unitPrice : item.price;
}

export function lineImage(item: CartItem): string | undefined {
  if (item.type === "custom_pack") {
    return item.perfumes?.[0]?.imageUrl;
  }
  return item.imageUrl;
}

// Captures the display fields of a perfume onto a cart line at add-to-cart
// time, so the checkout/cart pages never need to look the perfume back up.
export function toCartPerfumeSummary(perfume: Perfume): CartPerfumeSummary {
  return {
    id: perfume.id,
    name: perfume.name,
    description: perfume.description,
    imageUrl: perfume.imageUrl,
    scentFamily: perfume.scentFamily,
    concentration: perfume.concentration,
  };
}
