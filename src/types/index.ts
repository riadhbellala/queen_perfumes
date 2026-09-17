export type LocalizedString = {
  fr: string;
  ar: string;
};

export type Perfume = {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  price?: number;
  imageUrl?: string;
  scentFamily: string;
  concentration: "EDT" | "EDP" | "Parfum";
  inStock: boolean;
};

export type Pack = {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  imageUrl?: string;
  perfumeIds: string[];
};

export type PackSizePricing = {
  size: 2 | 3 | 4 | 5 | 6;
  price: number;
};

export type CustomPackOrder = {
  size: 2 | 3 | 4 | 5 | 6;
  price: number;
  selectedPerfumeIds: string[];
};

// ─── Cart Types ───────────────────────────────────────────────────────────────

// A snapshot of a perfume's display details, captured at add-to-cart time.
// Cart lines for a pack/custom pack only ever stored perfume *ids* — which
// meant the checkout page had to look each one up again afterwards, and it
// looked them up in placeholder-data.ts (real Supabase ids never match that
// mock file, so nothing rendered). Denormalizing this snapshot onto the cart
// line itself removes the lookup entirely, the same way name/imageUrl are
// already denormalized on CartItemPerfume/CartItemPack below.
export type CartPerfumeSummary = {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrl?: string;
  scentFamily: string;
  concentration: "EDT" | "EDP" | "Parfum";
};

export type CartItemPerfume = {
  cartLineId: string;
  type: "perfume";
  perfumeId: string;
  name: LocalizedString;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  perfume?: CartPerfumeSummary;
};

export type CartItemPack = {
  cartLineId: string;
  type: "pack";
  packId: string;
  name: LocalizedString;
  imageUrl?: string;
  price: number;
  quantity: number;
  perfumeIds: string[];
  perfumes?: CartPerfumeSummary[];
};

export type CartItemCustomPack = {
  cartLineId: string;
  type: "custom_pack";
  size: 2 | 3 | 4 | 5 | 6;
  selectedPerfumeIds: string[];
  perfumes?: CartPerfumeSummary[];
  price: number;
  quantity: number;
};

export type CartItem = CartItemPerfume | CartItemPack | CartItemCustomPack;

// Plain `Omit` on a union collapses to only the members' shared keys.
// This distributes the omission over each member instead, keeping their own fields.
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type NewCartItem = DistributiveOmit<CartItem, "cartLineId">;

