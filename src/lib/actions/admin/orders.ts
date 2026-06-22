"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export async function updateOrderStatus(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
}

export async function updatePaymentStatus(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  const paymentStatus = String(formData.get("paymentStatus")) as PaymentStatus;
  await prisma.order.update({ where: { id }, data: { paymentStatus } });
  revalidatePath("/admin/orders");
}
