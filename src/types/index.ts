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

export type CartItemPerfume = {
  cartLineId: string;
  type: "perfume";
  perfumeId: string;
  name: LocalizedString;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
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
};

export type CartItemCustomPack = {
  cartLineId: string;
  type: "custom_pack";
  size: 2 | 3 | 4 | 5 | 6;
  selectedPerfumeIds: string[];
  price: number;
  quantity: number;
};

export type CartItem = CartItemPerfume | CartItemPack | CartItemCustomPack;

// Plain `Omit` on a union collapses to only the members' shared keys.
// This distributes the omission over each member instead, keeping their own fields.
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type NewCartItem = DistributiveOmit<CartItem, "cartLineId">;

