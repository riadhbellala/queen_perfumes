import * as XLSX from "xlsx";
import { ORDER_STATUS_LABELS, formatOrderDate, type OrderStatus } from "@/lib/order-status";

export type ExportOrderRow = {
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

export type ExportOrderItemRow = {
  order_id: string;
  item_type: "perfume" | "pack" | "custom_pack";
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

const ITEM_TYPE_LABEL: Record<ExportOrderItemRow["item_type"], string> = {
  perfume: "Parfum",
  pack: "Box",
  custom_pack: "Box personnalisé",
};

// Entirely client-side: builds the workbook from data already in memory and
// triggers a direct browser download — no server round-trip, no API route.
export function exportOrdersToExcel(orders: ExportOrderRow[], items: ExportOrderItemRow[]) {
  const workbook = XLSX.utils.book_new();

  const ordersSheetData = orders.map((order) => ({
    ID: order.id.slice(0, 8),
    Client: order.customer_name,
    Téléphone: order.phone,
    Wilaya: order.wilaya,
    Adresse: order.address,
    "Sous-total (DA)": order.subtotal,
    "Frais de livraison (DA)": order.delivery_fee,
    "Total (DA)": order.total,
    Statut: ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status,
    Date: formatOrderDate(order.created_at),
  }));
  const ordersSheet = XLSX.utils.json_to_sheet(ordersSheetData);
  XLSX.utils.book_append_sheet(workbook, ordersSheet, "Commandes");

  const itemsSheetData = items.map((item) => ({
    "ID Commande": item.order_id.slice(0, 8),
    Type: ITEM_TYPE_LABEL[item.item_type],
    Article: item.name,
    Quantité: item.quantity,
    "Prix unitaire (DA)": item.unit_price,
    "Total ligne (DA)": item.line_total,
  }));
  const itemsSheet = XLSX.utils.json_to_sheet(itemsSheetData);
  XLSX.utils.book_append_sheet(workbook, itemsSheet, "Détails articles");

  const dateStr = new Intl.DateTimeFormat("fr-CA").format(new Date());
  XLSX.writeFile(workbook, `commandes_QueenOfPerfumes_${dateStr}.xlsx`);
}
