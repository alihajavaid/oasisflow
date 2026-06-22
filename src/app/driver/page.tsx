import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEPOT_LAT, DEPOT_LNG } from "@/lib/constants";
import { DriverRouteView } from "@/components/DriverRouteView";

export const dynamic = "force-dynamic";

export default async function DriverHomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const routes = await prisma.route.findMany({
    where: { driverId: user.id, status: { in: ["PLANNED", "IN_PROGRESS"] } },
    include: {
      stops: {
        orderBy: { sequence: "asc" },
        include: { deliveryRequest: { include: { customer: true, couponBook: true, order: true } } },
      },
    },
    orderBy: { date: "asc" },
  });

  if (routes.length === 0) {
    return (
      <div className="card p-8 text-center text-brand-700">
        You have no routes assigned right now. Check back once the office dispatches your next route.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {routes.map((r) => (
        <div key={r.id}>
          <h2 className="mb-3 text-xl font-bold text-brand-900">
            Route for {r.date.toLocaleDateString()} &mdash; {r.status}
          </h2>
          <DriverRouteView
            routeId={r.id}
            routeStatus={r.status}
            depot={{ lat: r.startLat ?? DEPOT_LAT, lng: r.startLng ?? DEPOT_LNG }}
            stops={r.stops.map((s) => ({
              id: s.id,
              sequence: s.sequence,
              status: s.status,
              lat: s.deliveryRequest.lat,
              lng: s.deliveryRequest.lng,
              customerName: s.deliveryRequest.customer.name,
              address: s.deliveryRequest.address,
              bottlesQty: s.deliveryRequest.bottlesQty,
              emptiesToPick: s.deliveryRequest.emptiesToPick,
              requiresCoupon: Boolean(s.deliveryRequest.couponBookId),
              startedAt: s.startedAt ? s.startedAt.toISOString() : null,
              orderTotal: s.deliveryRequest.order?.totalAmount ?? null,
            }))}
          />
        </div>
      ))}
    </div>
  );
}
