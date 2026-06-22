"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type RedeemState = { error?: string; ok?: boolean };

export async function startRoute(formData: FormData) {
  await requireUser(["DRIVER"]);
  const routeId = String(formData.get("routeId"));
  await prisma.route.update({ where: { id: routeId }, data: { status: "IN_PROGRESS" } });
  revalidatePath("/driver");
}

export async function startStopDelivery(formData: FormData) {
  const driver = await requireUser(["DRIVER"]);
  const stopId = String(formData.get("stopId"));

  const stop = await prisma.stop.findUnique({ where: { id: stopId }, include: { route: true } });
  if (!stop || stop.route.driverId !== driver.id) throw new Error("Stop not found.");

  await prisma.$transaction([
    prisma.stop.update({ where: { id: stopId }, data: { startedAt: new Date(), status: "OUT_FOR_DELIVERY" } }),
    prisma.deliveryRequest.update({ where: { id: stop.deliveryRequestId }, data: { status: "OUT_FOR_DELIVERY" } }),
  ]);

  revalidatePath("/driver");
}

export async function deliverStop(_prev: RedeemState, formData: FormData): Promise<RedeemState> {
  const driver = await requireUser(["DRIVER"]).catch(() => null);
  if (!driver) return { error: "Not authenticated." };

  const stopId = String(formData.get("stopId"));
  const codesRaw = String(formData.get("couponCodes") ?? "");
  const cashReceived = formData.get("cashReceived") === "on";
  const cashAmountRaw = formData.get("cashAmount");
  const cashAmount = cashAmountRaw ? Number(cashAmountRaw) : null;

  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: { route: true, deliveryRequest: { include: { couponBook: true } } },
  });
  if (!stop || stop.route.driverId !== driver.id) return { error: "Stop not found." };
  if (stop.status === "DELIVERED") return { error: "This stop is already marked delivered." };

  const dr = stop.deliveryRequest;

  if (dr.couponBookId) {
    const codes = codesRaw
      .split(/[\s,]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    if (codes.length !== dr.bottlesQty) {
      return { error: `Enter exactly ${dr.bottlesQty} coupon code(s), one per bottle.` };
    }

    const coupons = await prisma.coupon.findMany({ where: { code: { in: codes } } });
    if (coupons.length !== codes.length) {
      return { error: "One or more coupon codes were not found." };
    }
    for (const c of coupons) {
      if (c.couponBookId !== dr.couponBookId) {
        return { error: `Coupon ${c.code} does not belong to this customer's coupon book.` };
      }
      if (c.status !== "UNUSED") {
        return { error: `Coupon ${c.code} has already been redeemed and cannot be used again.` };
      }
    }

    await prisma.$transaction([
      ...coupons.map((c) =>
        prisma.coupon.update({
          where: { id: c.id },
          data: { status: "USED", usedAt: new Date(), usedByDriverId: driver.id },
        })
      ),
      prisma.couponBook.update({
        where: { id: dr.couponBookId },
        data: { remainingCoupons: { decrement: codes.length } },
      }),
      prisma.stop.update({
        where: { id: stop.id },
        data: { status: "DELIVERED", deliveredAt: new Date(), cashReceived: false },
      }),
      prisma.deliveryRequest.update({ where: { id: dr.id }, data: { status: "DELIVERED" } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.stop.update({
        where: { id: stop.id },
        data: { status: "DELIVERED", deliveredAt: new Date(), cashReceived, cashAmount },
      }),
      prisma.deliveryRequest.update({ where: { id: dr.id }, data: { status: "DELIVERED" } }),
      ...(dr.orderId
        ? [
            prisma.order.update({
              where: { id: dr.orderId },
              data: { status: "DELIVERED", ...(cashReceived ? { paymentStatus: "PAID" } : {}) },
            }),
          ]
        : []),
    ]);
  }

  const bottleItem = await prisma.inventoryItem.findUnique({ where: { sku: "BOTTLE-5GAL" } });
  if (bottleItem) {
    await prisma.inventoryItem.update({ where: { id: bottleItem.id }, data: { quantity: { decrement: dr.bottlesQty } } });
    await prisma.inventoryTransaction.create({
      data: { itemId: bottleItem.id, type: "OUT", quantity: dr.bottlesQty, reason: `Delivered to ${dr.address}` },
    });
  }

  revalidatePath("/driver");
  revalidatePath("/account/coupons");
  revalidatePath("/account/orders");
  return { ok: true };
}
