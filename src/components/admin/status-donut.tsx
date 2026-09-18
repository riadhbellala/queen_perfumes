"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { OrderStatus } from "@/lib/order-status";

// Matches the badge colors in order-status.ts (amber/blue/purple/green/red)
// so the donut, the legend dots here, and the status badges on /admin/commandes
// never drift into a second, inconsistent color scheme for the same statuses.
export const STATUS_HEX: Record<OrderStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#a855f7",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  refused: "#dc2626",
};

export function StatusDonut({ data }: { data: { status: OrderStatus; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const nonEmpty = data.filter((d) => d.count > 0);
  const chartData = nonEmpty.length > 0 ? nonEmpty : [{ status: "pending" as OrderStatus, count: 1 }];

  return (
    <div className="relative mx-auto h-[180px] w-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="status"
            innerRadius={62}
            outerRadius={82}
            paddingAngle={nonEmpty.length > 1 ? 3 : 0}
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={nonEmpty.length > 0 ? STATUS_HEX[entry.status] : "#e4e4e7"} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-zinc-900">{total}</span>
        <span className="text-[11px] text-zinc-400">commandes</span>
      </div>
    </div>
  );
}
