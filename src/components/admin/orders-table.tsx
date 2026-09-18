"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { exportOrdersToExcel, type ExportOrderItemRow } from "@/lib/export-orders";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, formatOrderDate, isOrderStatus } from "@/lib/order-status";
import { Eye, Download } from "lucide-react";

export type AdminOrderRow = {
  id: string;
  customer_name: string;
  phone: string;
  wilaya: string;
  address: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
};

const FILTERS = [{ key: "all", label: "Toutes" }, ...ORDER_STATUSES.map((s) => ({ key: s, label: ORDER_STATUS_LABELS[s] }))];

export function OrdersTable({
  orders,
  itemsByOrderId,
}: {
  orders: AdminOrderRow[];
  /** Resolved order-item rows (perfume/pack names already looked up), used
      only for the Excel export — not rendered in this table. */
  itemsByOrderId: Record<string, ExportOrderItemRow[]>;
}) {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("statut");
  const [filter, setFilter] = useState<string>(initialStatus && isOrderStatus(initialStatus) ? initialStatus : "all");

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  function handleExport() {
    const orderIds = new Set(filtered.map((o) => o.id));
    const items = filtered.flatMap((o) => itemsByOrderId[o.id] ?? []).filter((item) => orderIds.has(item.order_id));
    exportOrdersToExcel(filtered, items);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={handleExport} className="gap-2">
          <Download size={16} data-icon="inline-start" />
          Exporter en Excel
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Wilaya</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs text-zinc-500">{order.id.slice(0, 8)}</TableCell>
                <TableCell className="font-medium text-zinc-900">{order.customer_name}</TableCell>
                <TableCell className="text-zinc-500">{order.phone}</TableCell>
                <TableCell className="text-zinc-500">{order.wilaya}</TableCell>
                <TableCell className="text-zinc-900">{order.total} DA</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-zinc-500">{formatOrderDate(order.created_at)}</TableCell>
                <TableCell className="text-end">
                  <Link href={`/admin/commandes/${order.id}`}>
                    <Button variant="outline" size="icon-sm" aria-label="Voir le détail">
                      <Eye size={14} />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-zinc-500">
                  Aucune commande trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
