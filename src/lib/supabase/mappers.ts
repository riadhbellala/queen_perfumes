import type { Perfume, Pack, PackSizePricing } from "@/types";

export type PerfumeRow = {
  id: string;
  name_fr: string;
  name_ar: string;
  description_fr: string | null;
  description_ar: string | null;
  price: number | string | null;
  image_url: string | null;
  scent_family: string | null;
  concentration: string | null;
  stock: number;
  is_active: boolean;
};

export type PackRow = {
  id: string;
  name_fr: string;
  name_ar: string;
  description_fr: string | null;
  description_ar: string | null;
  price: number | string;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
};

export type PackSizePricingRow = {
  size: number;
  price: number | string;
};

export function mapPerfumeRow(row: PerfumeRow): Perfume {
  return {
    id: row.id,
    name: { fr: row.name_fr, ar: row.name_ar },
    description: { fr: row.description_fr ?? "", ar: row.description_ar ?? "" },
    price: row.price !== null ? Number(row.price) : undefined,
    imageUrl: row.image_url ?? undefined,
    scentFamily: row.scent_family ?? "",
    concentration: (row.concentration as Perfume["concentration"]) ?? "EDT",
    inStock: row.stock > 0,
  };
}

export function mapPackRow(row: PackRow, perfumeIds: string[] = []): Pack {
  return {
    id: row.id,
    name: { fr: row.name_fr, ar: row.name_ar },
    description: { fr: row.description_fr ?? "", ar: row.description_ar ?? "" },
    price: Number(row.price),
    imageUrl: row.image_url ?? undefined,
    perfumeIds,
  };
}

export function mapPackSizePricingRow(row: PackSizePricingRow): PackSizePricing {
  return {
    size: row.size as PackSizePricing["size"],
    price: Number(row.price),
  };
}
