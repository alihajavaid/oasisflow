"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { InventoryTxnType } from "@prisma/client";

const itemSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  unit: z.string().min(1),
  quantity: z.coerce.number().int().min(0),
  reorderLevel: z.coerce.number().int().min(0),
  costPerUnit: z.coerce.number().min(0),
});

export async function createInventoryItem(formData: FormData) {
  await requireUser(["ADMIN"]);
  const data = itemSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    unit: formData.get("unit"),
    quantity: formData.get("quantity"),
    reorderLevel: formData.get("reorderLevel"),
    costPerUnit: formData.get("costPerUnit"),
  });
  await prisma.inventoryItem.create({ data });
  revalidatePath("/admin/inventory");
}

export async function adjustInventory(formData: FormData) {
  await requireUser(["ADMIN"]);
  const itemId = String(formData.get("itemId"));
  const type = String(formData.get("type")) as InventoryTxnType;
  const quantity = Number(formData.get("quantity"));
  const reason = String(formData.get("reason") ?? "");

  if (!quantity || quantity <= 0) throw new Error("Quantity must be positive.");

  const item = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: itemId } });
  const delta = type === "OUT" ? -quantity : quantity;
  const newQty = Math.max(0, item.quantity + delta);

  await prisma.$transaction([
    prisma.inventoryItem.update({ where: { id: itemId }, data: { quantity: newQty } }),
    prisma.inventoryTransaction.create({ data: { itemId, type, quantity, reason: reason || null } }),
  ]);

  revalidatePath("/admin/inventory");
}
