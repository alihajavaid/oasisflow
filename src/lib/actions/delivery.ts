"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { pseudoGeocode } from "@/lib/geo";

export type DeliveryFormState = { error?: string; ok?: boolean };

const schema = z.object({
  source: z.enum(["COUPON_BOOK", "DIRECT"]),
  couponBookId: z.string().optional(),
  bottlesQty: z.coerce.number().int().min(1).max(20),
  address: z.string().min(5),
});

export async function requestDelivery(_prev: DeliveryFormState, formData: FormData): Promise<DeliveryFormState> {
  const user = await requireUser(["CUSTOMER"]).catch(() => null);
  if (!user) return { error: "Please login first." };

  const parsed = schema.safeParse({
    source: formData.get("source"),
    couponBookId: formData.get("couponBookId") || undefined,
    bottlesQty: formData.get("bottlesQty"),
    address: formData.get("address"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { source, couponBookId, bottlesQty, address } = parsed.data;
  const { lat, lng } = pseudoGeocode(address);

  if (source === "COUPON_BOOK") {
    if (!couponBookId) return { error: "Select a coupon book." };
    const book = await prisma.couponBook.findFirst({ where: { id: couponBookId, customerId: user.id } });
    if (!book) return { error: "Coupon book not found." };
    if (book.remainingCoupons < bottlesQty) {
      return { error: `This book only has ${book.remainingCoupons} coupon(s) left.` };
    }
    await prisma.deliveryRequest.create({
      data: {
        customerId: user.id,
        couponBookId: book.id,
        bottlesQty,
        emptiesToPick: bottlesQty,
        address,
        lat,
        lng,
        status: "REQUESTED",
      },
    });
  } else {
    const product = await prisma.product.findUnique({ where: { slug: "5-gallon-bottle" } });
    if (!product) return { error: "Product not configured." };
    const order = await prisma.order.create({
      data: {
        customerId: user.id,
        totalAmount: product.price * bottlesQty,
        deliveryAddress: address,
        lat,
        lng,
        items: { create: [{ productId: product.id, quantity: bottlesQty, price: product.price }] },
      },
    });
    await prisma.deliveryRequest.create({
      data: {
        customerId: user.id,
        orderId: order.id,
        bottlesQty,
        emptiesToPick: bottlesQty,
        address,
        lat,
        lng,
        status: "REQUESTED",
      },
    });
  }

  revalidatePath("/account/schedule");
  return { ok: true };
}
