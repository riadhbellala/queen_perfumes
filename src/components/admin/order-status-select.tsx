"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function handleChange(next: string) {
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", orderId);
    setUpdating(false);

    if (error) {
      console.error("Failed to update order status:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du statut.");
      return;
    }

    toast.success("Statut de la commande mis à jour.");
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={(v) => handleChange(v as string)} disabled={updating}>
      <SelectTrigger className="h-10 w-full rounded-lg sm:w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
