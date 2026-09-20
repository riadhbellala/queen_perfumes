import { createClient } from "@/lib/supabase/server";
import { OrdersTable, type AdminOrderRow } from "@/components/admin/orders-table";
import type { ExportOrderItemRow } from "@/lib/export-orders";

export default async function AdminCommandesPage() {
  const supabase = await createClient();

  const [{ data: orderRows }, { data: itemRows }] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("order_items").select("*"),
  ]);

  const orders: AdminOrderRow[] = (orderRows ?? []).map((row) => ({
    id: row.id,
    customer_name: row.customer_name,
    phone: row.phone,
    wilaya: row.wilaya,
    address: row.address,
    subtotal: Number(row.subtotal),
    delivery_fee: Number(row.delivery_fee),
    total: Number(row.total),
    status: row.status,
    created_at: row.created_at,
  }));

  const items = itemRows ?? [];
  const perfumeIds = [...new Set(items.filter((i) => i.item_type === "perfume" && i.perfume_id).map((i) => i.perfume_id as string))];
  const packIds = [...new Set(items.filter((i) => i.item_type === "pack" && i.pack_id).map((i) => i.pack_id as string))];

  const [{ data: perfumeRows }, { data: packRows }] = await Promise.all([
    perfumeIds.length
      ? supabase.from("perfumes").select("id, name_fr").in("id", perfumeIds)
      : Promise.resolve({ data: [] as { id: string; name_fr: string }[] }),
    packIds.length
      ? supabase.from("packs").select("id, name_fr").in("id", packIds)
      : Promise.resolve({ data: [] as { id: string; name_fr: string }[] }),
  ]);

  const perfumeNameById = new Map((perfumeRows ?? []).map((p) => [p.id, p.name_fr]));
  const packNameById = new Map((packRows ?? []).map((p) => [p.id, p.name_fr]));

  const itemsByOrderId: Record<string, ExportOrderItemRow[]> = {};
  for (const item of items) {
    let name: string;
    if (item.item_type === "perfume") {
      name = (item.perfume_id && perfumeNameById.get(item.perfume_id)) || "Parfum supprimé";
    } else if (item.item_type === "pack") {
      name = (item.pack_id && packNameById.get(item.pack_id)) || "Box supprimée";
    } else {
      name = `Box personnalisé (${item.custom_pack_size ?? item.custom_pack_perfume_ids?.length ?? "?"} parfums)`;
    }

    const exportRow: ExportOrderItemRow = {
      order_id: item.order_id,
      item_type: item.item_type,
      name,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      line_total: Number(item.line_total),
    };

    (itemsByOrderId[item.order_id] ??= []).push(exportRow);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Commandes</h1>
      <p className="mt-1 text-sm text-zinc-500">{orders.length} commande(s) au total.</p>

      <div className="mt-6">
        <OrdersTable orders={orders} itemsByOrderId={itemsByOrderId} />
      </div>
    </div>
  );
}
