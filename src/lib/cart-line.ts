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

// The shape place_order()'s p_items jsonb parameter expects — see the
// "Supabase Schema Reference" section of CLAUDE.md. Only the fields
// relevant to that line's item_type are populated.
export type OrderItemPayload = {
  item_type: CartItem["type"];
  perfume_id?: string;
  pack_id?: string;
  custom_pack_size?: number;
  custom_pack_perfume_ids?: string[];
  quantity: number;
  unit_price: number;
  line_total: number;
};

export function toOrderItemPayload(item: CartItem): OrderItemPayload {
  const unitPrice = lineUnitPrice(item);
  const base = {
    quantity: item.quantity,
    unit_price: unitPrice,
    line_total: unitPrice * item.quantity,
  };

  if (item.type === "perfume") {
    return { item_type: "perfume", perfume_id: item.perfumeId, ...base };
  }
  if (item.type === "pack") {
    return { item_type: "pack", pack_id: item.packId, ...base };
  }
  return {
    item_type: "custom_pack",
    custom_pack_size: item.size,
    custom_pack_perfume_ids: item.selectedPerfumeIds,
    ...base,
  };
}
