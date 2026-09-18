"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// The one deliberate accent color in the whole (otherwise neutral) admin —
// the brand's own darker button-gold (#8C6A34, see CLAUDE.md's color-system
// notes), not a generic dashboard-template teal. Admin still doesn't pull in
// the storefront's CSS variables (see "Admin dashboard stays unthemed"), this
// is just a literal hex handed to a chart library that needs one.
const CHART_COLOR = "#8C6A34";

export function RevenueChart({ data }: { data: { label: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.35} />
            <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#f1f1f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))}
        />
        <Tooltip
          formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} DA`, "Ventes"]}
          labelStyle={{ color: "#3f3f46", fontWeight: 600 }}
          contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="total" stroke={CHART_COLOR} strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
