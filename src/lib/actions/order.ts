"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateCouponCode } from "@/lib/coupon";
import { pseudoGeocode } from "@/lib/geo";

export type CheckoutState = { error?: string; orderId?: string };

const lineSchema = z.object({
  kind: z.enum(["PRODUCT", "COUPON_BOOK"]),
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
});

export async function checkout(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await requireUser(["CUSTOMER"]).catch(() => null);
  if (!user) {
    return { error: "Please login to place an order." };
  }

  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const linesRaw = String(formData.get("linesJson") ?? "[]");

  if (!address) return { error: "Delivery address is required." };

  let lines: z.infer<typeof lineSchema>[];
  try {
    lines = z.array(lineSchema).min(1).parse(JSON.parse(linesRaw));
  } catch {
    return { error: "Your cart looks invalid. Please refresh and try again." };
  }

  const totalAmount = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const { lat, lng } = pseudoGeocode(address);

  const order = await prisma.order.create({
    data: {
      customerId: user.id,
      totalAmount,
      deliveryAddress: address,
      notes: notes || null,
      lat,
      lng,
      items: {
        create: lines.map((l) => ({
          productId: l.kind === "PRODUCT" ? l.id : null,
          couponBookTypeId: l.kind === "COUPON_BOOK" ? l.id : null,
          quantity: l.quantity,
          price: l.price,
        })),
      },
    },
  });

  let bottleQty = 0;
  for (const line of lines) {
    if (line.kind === "PRODUCT") {
      const product = await prisma.product.findUnique({ where: { id: line.id } });
      if (product?.slug === "5-gallon-bottle") bottleQty += line.quantity;
    } else {
      const type = await prisma.couponBookType.findUniqueOrThrow({ where: { id: line.id } });
      for (let i = 0; i < line.quantity; i++) {
        const book = await prisma.couponBook.create({
          data: {
            customerId: user.id,
            typeId: type.id,
            totalCoupons: type.totalCoupons,
            remainingCoupons: type.totalCoupons,
          },
        });
        await prisma.coupon.createMany({
          data: Array.from({ length: type.totalCoupons }, () => ({
            code: generateCouponCode(),
            couponBookId: book.id,
          })),
        });
      }
    }
  }

  if (bottleQty > 0) {
    await prisma.deliveryRequest.create({
      data: {
        customerId: user.id,
        orderId: order.id,
        bottlesQty: bottleQty,
        emptiesToPick: bottleQty,
        address,
        lat,
        lng,
        status: "REQUESTED",
      },
    });
  }

  return { orderId: order.id };
}
