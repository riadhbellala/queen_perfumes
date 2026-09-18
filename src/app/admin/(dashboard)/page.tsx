import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin-constants";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { StatusDonut, STATUS_HEX } from "@/components/admin/status-donut";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/order-status";
import { Wallet, ShoppingCart, Users, Truck, TrendingUp, TrendingDown } from "lucide-react";

// Every number on this page is real (Supabase-backed) — there's no coupons/
// newsletter/customer-accounts system in this app, so unlike the reference
// dashboard this doesn't fake a "Current Offer" or "Newsletter" panel just
// to fill the layout. "Top Selling Products" and "Stock à surveiller" stand
// in for those, using data this project actually has.

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

function TrendBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
      <Icon size={12} />
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const last30Start = new Date(now);
  last30Start.setDate(now.getDate() - 30);
  const prev30Start = new Date(now);
  prev30Start.setDate(now.getDate() - 60);

  const [
    { data: ordersLast30 },
    { data: ordersPrev30 },
    { count: pendingDeliveryCount },
    { data: lowStockRows },
    { data: allStatusRows },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, status, phone, created_at")
      .gte("created_at", last30Start.toISOString()),
    supabase
      .from("orders")
      .select("id, total, status, phone")
      .gte("created_at", prev30Start.toISOString())
      .lt("created_at", last30Start.toISOString()),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["confirmed", "shipped"]),
    supabase
      .from("perfumes")
      .select("id, name_fr, stock")
      .eq("is_active", true)
      .order("stock", { ascending: true })
      .limit(5),
    supabase.from("orders").select("status"),
  ]);

  const isValid = (status: string) => status !== "cancelled" && status !== "refused";
  const validLast30 = (ordersLast30 ?? []).filter((o) => isValid(o.status));
  const validPrev30 = (ordersPrev30 ?? []).filter((o) => isValid(o.status));

  const revenueLast30 = validLast30.reduce((sum, o) => sum + Number(o.total), 0);
  const revenuePrev30 = validPrev30.reduce((sum, o) => sum + Number(o.total), 0);
  const ordersCountLast30 = (ordersLast30 ?? []).length;
  const ordersCountPrev30 = (ordersPrev30 ?? []).length;
  const customersLast30 = new Set((ordersLast30 ?? []).map((o) => o.phone)).size;
  const customersPrev30 = new Set((ordersPrev30 ?? []).map((o) => o.phone)).size;
  const avgBasket = validLast30.length ? revenueLast30 / validLast30.length : 0;

  // Daily revenue, last 14 days — enough points for a real trend line
  // without cramming all 30 days of labels onto the x-axis.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getTime() - (13 - i) * DAY_MS);
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), total: 0 };
  });
  const dayIndexByKey = new Map(days.map((d, i) => [d.key, i]));
  for (const order of validLast30) {
    const key = new Date(order.created_at).toISOString().slice(0, 10);
    const idx = dayIndexByKey.get(key);
    if (idx !== undefined) days[idx].total += Number(order.total);
  }

  // Order status breakdown — all-time, not just the last 30 days: this is a
  // "what's the current pipeline made of" snapshot, not a period metric.
  const statusCounts = new Map<string, number>();
  for (const row of allStatusRows ?? []) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }
  const statusData = ORDER_STATUSES.map((status) => ({ status, count: statusCounts.get(status) ?? 0 }));

  // Top-selling products, last 30 days — aggregated from real order_items,
  // not a guess. custom_pack lines aren't tied to one catalog id, so they're
  // not part of this specific ranking (they still count in revenue/orders).
  const orderIdsLast30 = (ordersLast30 ?? []).map((o) => o.id);
  const { data: itemRows } = orderIdsLast30.length
    ? await supabase.from("order_items").select("item_type, perfume_id, pack_id, quantity").in("order_id", orderIdsLast30)
    : { data: [] as { item_type: string; perfume_id: string | null; pack_id: string | null; quantity: number }[] };

  const qtyByKey = new Map<string, number>();
  for (const item of itemRows ?? []) {
    const key =
      item.item_type === "perfume" && item.perfume_id
        ? `perfume:${item.perfume_id}`
        : item.item_type === "pack" && item.pack_id
          ? `pack:${item.pack_id}`
          : null;
    if (key) qtyByKey.set(key, (qtyByKey.get(key) ?? 0) + item.quantity);
  }

  const topKeys = [...qtyByKey.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topPerfumeIds = topKeys.filter(([key]) => key.startsWith("perfume:")).map(([key]) => key.split(":")[1]);
  const topPackIds = topKeys.filter(([key]) => key.startsWith("pack:")).map(([key]) => key.split(":")[1]);

  const [{ data: topPerfumeRows }, { data: topPackRows }] = await Promise.all([
    topPerfumeIds.length
      ? supabase.from("perfumes").select("id, name_fr, image_url").in("id", topPerfumeIds)
      : Promise.resolve({ data: [] as { id: string; name_fr: string; image_url: string | null }[] }),
    topPackIds.length
      ? supabase.from("packs").select("id, name_fr, image_url").in("id", topPackIds)
      : Promise.resolve({ data: [] as { id: string; name_fr: string; image_url: string | null }[] }),
  ]);
  const perfumeById = new Map((topPerfumeRows ?? []).map((p) => [p.id, p]));
  const packById = new Map((topPackRows ?? []).map((p) => [p.id, p]));

  const topProducts = topKeys
    .map(([key, qty]) => {
      const [type, id] = key.split(":");
      const row = type === "perfume" ? perfumeById.get(id) : packById.get(id);
      return row ? { id: key, name: row.name_fr, imageUrl: row.image_url, qty } : null;
    })
    .filter((p): p is { id: string; name: string; imageUrl: string | null; qty: number } => p !== null);

  const stats = [
    {
      label: "Chiffre d'affaires",
      value: `${revenueLast30.toLocaleString("fr-FR")} DA`,
      trend: pctChange(revenueLast30, revenuePrev30),
      icon: Wallet,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "Commandes",
      value: String(ordersCountLast30),
      trend: pctChange(ordersCountLast30, ordersCountPrev30),
      icon: ShoppingCart,
      tint: "bg-blue-50 text-blue-600",
    },
    {
      label: "Clients",
      value: String(customersLast30),
      trend: pctChange(customersLast30, customersPrev30),
      icon: Users,
      tint: "bg-purple-50 text-purple-600",
    },
    {
      label: "Livraisons en cours",
      value: String(pendingDeliveryCount ?? 0),
      trend: null as number | null,
      icon: Truck,
      tint: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Aperçu</h1>
          <p className="mt-1 text-sm text-zinc-500">Activité des 30 derniers jours.</p>
        </div>
        <div className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 sm:px-4 sm:py-2 sm:text-sm">
          {now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-900 sm:text-sm">{stat.label}</p>
                  <p className="text-[10px] text-zinc-400 sm:text-xs">30 derniers jours</p>
                </div>
                <div className={`grid size-8 shrink-0 place-items-center rounded-full sm:size-10 ${stat.tint}`}>
                  <stat.icon size={15} className="sm:hidden" />
                  <stat.icon size={18} className="hidden sm:block" />
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2 sm:mt-4">
                <p className="text-lg font-semibold text-zinc-900 sm:text-2xl">{stat.value}</p>
                {stat.trend !== null && <TrendBadge value={stat.trend} />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue trend + order status breakdown */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">Analyse des ventes</h2>
              <span className="text-xs text-zinc-400">14 derniers jours</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 border-b border-zinc-100 pb-5 sm:mt-6 sm:gap-4 sm:pb-6">
              <div className="min-w-0">
                <p className="truncate text-[10px] text-zinc-400 sm:text-xs">Chiffre d&apos;affaires</p>
                <p className="mt-1 truncate text-sm font-semibold text-zinc-900 sm:text-lg">{revenueLast30.toLocaleString("fr-FR")} DA</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] text-zinc-400 sm:text-xs">Commandes valides</p>
                <p className="mt-1 truncate text-sm font-semibold text-zinc-900 sm:text-lg">{validLast30.length}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] text-zinc-400 sm:text-xs">Panier moyen</p>
                <p className="mt-1 truncate text-sm font-semibold text-zinc-900 sm:text-lg">{Math.round(avgBasket).toLocaleString("fr-FR")} DA</p>
              </div>
            </div>
            <div className="mt-4 -ms-2 sm:ms-0">
              <RevenueChart data={days} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-zinc-900 sm:text-lg">Répartition des commandes</h2>
            <StatusDonut data={statusData} />
            <div className="mt-5 flex flex-col gap-2.5">
              {statusData
                .filter((s) => s.count > 0)
                .map((s) => (
                  <div key={s.status} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-zinc-600">
                      <span className="size-2 rounded-full" style={{ backgroundColor: STATUS_HEX[s.status] }} />
                      {ORDER_STATUS_LABELS[s.status]}
                    </span>
                    <span className="font-medium text-zinc-900">{s.count}</span>
                  </div>
                ))}
              {statusData.every((s) => s.count === 0) && (
                <p className="text-sm text-zinc-400">Aucune commande pour le moment.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top products + stock to watch */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-zinc-900 sm:text-lg">
              Meilleures ventes <span className="text-xs font-normal text-zinc-400">— 30 derniers jours</span>
            </h2>
            {topProducts.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucune vente sur cette période.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 sm:gap-4">
                {topProducts.map((product) => (
                  <div key={product.id} className="w-24 shrink-0 sm:w-32">
                    <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100">
                      {product.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <p className="mt-2 truncate text-xs font-medium text-zinc-900 sm:text-sm">{product.name}</p>
                    <p className="text-[10px] text-zinc-400 sm:text-xs">{product.qty} vendus</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-zinc-900 sm:text-lg">Stock à surveiller</h2>
            <div className="flex flex-col gap-4">
              {(lowStockRows ?? []).map((perfume) => {
                const pct = Math.max(4, Math.min(100, (perfume.stock / 20) * 100));
                const isLow = perfume.stock < LOW_STOCK_THRESHOLD;
                return (
                  <div key={perfume.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate text-zinc-700">{perfume.name_fr}</span>
                      <span className={`font-semibold ${isLow ? "text-red-600" : "text-zinc-900"}`}>{perfume.stock}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full ${isLow ? "bg-red-400" : "bg-zinc-900"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(lowStockRows ?? []).length === 0 && <p className="text-sm text-zinc-400">Aucun parfum actif.</p>}
            </div>
            <Link href="/admin/parfums?stock=faible" className="mt-4 inline-block text-sm font-medium text-zinc-900 hover:underline">
              Voir tous les parfums →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
