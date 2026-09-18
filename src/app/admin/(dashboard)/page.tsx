import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin-constants";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: pendingCount },
    { count: lowStockCount },
    { data: monthOrders },
    { count: activeBoxesCount },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("perfumes")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .lt("stock", LOW_STOCK_THRESHOLD),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", monthStart)
      .not("status", "in", "(cancelled,refused)"),
    supabase.from("packs").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const monthlySales = (monthOrders ?? []).reduce((sum, row) => sum + Number(row.total), 0);

  const stats = [
    {
      label: "Commandes en attente",
      value: String(pendingCount ?? 0),
      href: "/admin/commandes?statut=pending",
    },
    {
      label: "Parfums en stock faible",
      value: String(lowStockCount ?? 0),
      href: "/admin/parfums?stock=faible",
    },
    {
      label: "Total des ventes ce mois",
      value: `${monthlySales.toLocaleString("fr-FR")} DA`,
      href: null,
    },
    {
      label: "Boxes actifs",
      value: String(activeBoxesCount ?? 0),
      href: null,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Bienvenue</h1>
      <p className="mt-1 text-sm text-zinc-500">Aperçu de votre boutique.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const card = (
            <Card
              className={stat.href ? "transition-shadow hover:shadow-md" : undefined}
            >
              <CardHeader>
                <CardTitle>{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-zinc-900">{stat.value}</p>
              </CardContent>
            </Card>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
