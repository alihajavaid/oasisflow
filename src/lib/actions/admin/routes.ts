"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { optimizeRoute } from "@/lib/routeOptimizer";
import { DEPOT_LAT, DEPOT_LNG } from "@/lib/constants";

export async function createRoute(formData: FormData): Promise<void> {
  await requireUser(["ADMIN"]);

  const driverId = String(formData.get("driverId"));
  const date = String(formData.get("date"));
  const requestIds = formData.getAll("requestIds").map(String);

  if (!driverId || requestIds.length === 0) {
    throw new Error("Select a driver and at least one delivery stop.");
  }

  const requests = await prisma.deliveryRequest.findMany({ where: { id: { in: requestIds } } });

  const start = { id: "depot", lat: DEPOT_LAT, lng: DEPOT_LNG };
  const { order, totalDistanceKm } = optimizeRoute(
    start,
    requests.map((r) => ({ id: r.id, lat: r.lat, lng: r.lng }))
  );

  await prisma.route.create({
    data: {
      driverId,
      date: new Date(date),
      startLat: DEPOT_LAT,
      startLng: DEPOT_LNG,
      totalDistanceKm,
      stops: {
        create: order.map((point, idx) => ({
          deliveryRequestId: point.id,
          sequence: idx + 1,
        })),
      },
    },
  });

  await prisma.deliveryRequest.updateMany({
    where: { id: { in: requestIds } },
    data: { status: "SCHEDULED" },
  });

  revalidatePath("/admin/routes");
  revalidatePath("/driver");
}
