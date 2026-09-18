import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderPerfumeCard, type OrderCardPerfume } from "@/components/admin/order-perfume-card";
import { formatOrderDate, isOrderStatus } from "@/lib/order-status";
import { ChevronLeft, Phone } from "lucide-react";

type ResolvedLine = {
  id: string;
  item_type: "perfume" | "pack" | "custom_pack";
  quantity: number;
  unit_price: number;
  line_total: number;
  title: string;
  packDescription?: string | null;
  perfumes: OrderCardPerfume[];
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) {
    notFound();
  }

  const { data: orderItemRows } = await supabase.from("order_items").select("*").eq("order_id", id);
  const orderItems = orderItemRows ?? [];

  const packIds = [...new Set(orderItems.filter((i) => i.item_type === "pack" && i.pack_id).map((i) => i.pack_id as string))];

  const [{ data: packRows }, { data: packPerfumeLinks }] = await Promise.all([
    packIds.length
      ? supabase.from("packs").select("id, name_fr, description_fr").in("id", packIds)
      : Promise.resolve({ data: [] as { id: string; name_fr: string; description_fr: string | null }[] }),
    packIds.length
      ? supabase.from("pack_perfumes").select("pack_id, perfume_id").in("pack_id", packIds)
      : Promise.resolve({ data: [] as { pack_id: string; perfume_id: string }[] }),
  ]);

  const packById = new Map((packRows ?? []).map((p) => [p.id, p]));
  const perfumeIdsByPackId = new Map<string, string[]>();
  for (const link of packPerfumeLinks ?? []) {
    const list = perfumeIdsByPackId.get(link.pack_id) ?? [];
    list.push(link.perfume_id);
    perfumeIdsByPackId.set(link.pack_id, list);
  }

  // Every perfume id we'll need a full card for: direct perfume lines,
  // perfumes inside a pack, and perfumes inside a custom pack.
  const perfumeIdSet = new Set<string>();
  for (const item of orderItems) {
    if (item.item_type === "perfume" && item.perfume_id) perfumeIdSet.add(item.perfume_id);
    if (item.item_type === "custom_pack") {
      for (const pid of item.custom_pack_perfume_ids ?? []) perfumeIdSet.add(pid);
    }
  }
  for (const ids of perfumeIdsByPackId.values()) {
    for (const pid of ids) perfumeIdSet.add(pid);
  }

  const { data: perfumeRows } = perfumeIdSet.size
    ? await supabase
        .from("perfumes")
        .select("id, name_fr, description_fr, image_url, scent_family, concentration")
        .in("id", [...perfumeIdSet])
    : { data: [] as OrderCardPerfume[] };

  const perfumeById = new Map((perfumeRows ?? []).map((p) => [p.id, p as OrderCardPerfume]));

  const lines: ResolvedLine[] = orderItems.map((item) => {
    if (item.item_type === "perfume") {
      const perfume = item.perfume_id ? perfumeById.get(item.perfume_id) : undefined;
      return {
        id: item.id,
        item_type: item.item_type,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
        title: perfume?.name_fr ?? "Parfum supprimé",
        perfumes: perfume ? [perfume] : [],
      };
    }

    if (item.item_type === "pack") {
      const pack = item.pack_id ? packById.get(item.pack_id) : undefined;
      const linkedIds = item.pack_id ? perfumeIdsByPackId.get(item.pack_id) ?? [] : [];
      const perfumes = linkedIds.map((pid) => perfumeById.get(pid)).filter((p): p is OrderCardPerfume => !!p);
      return {
        id: item.id,
        item_type: item.item_type,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
        title: pack?.name_fr ?? "Box supprimée",
        packDescription: pack?.description_fr,
        perfumes,
      };
    }

    // custom_pack
    const ids: string[] = item.custom_pack_perfume_ids ?? [];
    const perfumes = ids
      .map((pid) => perfumeById.get(pid))
      .filter((p): p is OrderCardPerfume => !!p);
    return {
      id: item.id,
      item_type: item.item_type,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      line_total: Number(item.line_total),
      title: `Box personnalisé (${item.custom_pack_size ?? ids.length} parfums)`,
      perfumes,
    };
  });

  const status = isOrderStatus(order.status) ? order.status : "pending";

  return (
    <div>
      <Link
        href="/admin/commandes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"
      >
        <ChevronLeft size={16} />
        Retour aux commandes
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-semibold text-zinc-900">
            Commande #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{formatOrderDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <OrderStatusSelect orderId={order.id} status={status} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer info */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold text-zinc-900">Informations client</h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-zinc-500">Nom</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{order.customer_name}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Téléphone</dt>
              <dd className="mt-0.5">
                <a
                  href={`tel:${order.phone}`}
                  className="inline-flex items-center gap-1.5 font-medium text-zinc-900 hover:underline"
                >
                  <Phone size={14} />
                  {order.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Wilaya</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{order.wilaya}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Adresse</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{order.address}</dd>
            </div>
            {order.note && (
              <div>
                <dt className="text-zinc-500">Note</dt>
                <dd className="mt-0.5 text-zinc-700">{order.note}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 border-t border-zinc-100 pt-4 text-sm">
            <div className="flex items-center justify-between text-zinc-500">
              <span>Sous-total</span>
              <span className="font-medium text-zinc-900">{Number(order.subtotal)} DA</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-zinc-500">
              <span>Frais de livraison</span>
              <span className="font-medium text-zinc-900">{Number(order.delivery_fee)} DA</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
              <span className="font-medium text-zinc-900">Total</span>
              <span className="text-lg font-bold text-zinc-900">{Number(order.total)} DA</span>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {lines.map((line) => (
            <div key={line.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4 pb-4">
                <div>
                  <p className="font-medium text-zinc-900">{line.title}</p>
                  <p className="text-xs text-zinc-500">Qté × {line.quantity}</p>
                </div>
                <p className="font-semibold text-zinc-900">{line.line_total} DA</p>
              </div>

              {line.item_type === "pack" && line.packDescription && (
                <p className="mb-3 text-sm leading-relaxed text-zinc-500">{line.packDescription}</p>
              )}

              {line.perfumes.length > 0 && (
                <div className="flex flex-col gap-3">
                  {line.perfumes.map((perfume, index) => (
                    <OrderPerfumeCard key={`${perfume.id}-${index}`} perfume={perfume} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
