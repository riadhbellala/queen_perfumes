import { ORDER_STATUS_BADGE_CLASS, ORDER_STATUS_LABELS, isOrderStatus } from "@/lib/order-status";

export function OrderStatusBadge({ status }: { status: string }) {
  const known = isOrderStatus(status);
  const className = known ? ORDER_STATUS_BADGE_CLASS[status] : "bg-zinc-100 text-zinc-600";
  const label = known ? ORDER_STATUS_LABELS[status] : status;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
