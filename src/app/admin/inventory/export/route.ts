import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildExcelResponse } from "@/lib/excel";

export async function GET() {
  await requireUser(["ADMIN"]);

  const items = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });

  return buildExcelResponse("oasisflow-inventory.xlsx", [
    {
      name: "Inventory",
      columns: [
        { header: "Item", key: "name", width: 28 },
        { header: "SKU", key: "sku", width: 18 },
        { header: "Quantity", key: "quantity", width: 12 },
        { header: "Unit", key: "unit", width: 12 },
        { header: "Reorder Level", key: "reorderLevel", width: 14 },
        { header: "Cost / Unit (AED)", key: "cost", width: 16 },
        { header: "Stock Value (AED)", key: "value", width: 16 },
      ],
      rows: items.map((i) => ({
        name: i.name,
        sku: i.sku,
        quantity: i.quantity,
        unit: i.unit,
        reorderLevel: i.reorderLevel,
        cost: i.costPerUnit,
        value: Math.round(i.quantity * i.costPerUnit * 100) / 100,
      })),
    },
  ]);
}
