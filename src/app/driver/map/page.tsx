import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEPOT_LAT, DEPOT_LNG } from "@/lib/constants";
import { optimizeRoute } from "@/lib/routeOptimizer";
import { DriverAreaMap } from "@/components/DriverAreaMap";

export const dynamic = "force-dynamic";

export default async function DriverMapPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.driverProfile.findUnique({
    where: { userId: user.id },
    include: { areas: true },
  });

  const stops = await prisma.stop.findMany({
    where: {
      route: { driverId: user.id, status: { in: ["PLANNED", "IN_PROGRESS"] } },
      status: { not: "DELIVERED" },
    },
    include: { deliveryRequest: { include: { customer: true, area: true } } },
  });

  const depot = { id: "depot", lat: DEPOT_LAT, lng: DEPOT_LNG };
  const points = stops.map((s) => ({ id: s.id, lat: s.deliveryRequest.lat, lng: s.deliveryRequest.lng }));
  const { order, totalDistanceKm } = optimizeRoute(depot, points);

  const byId = Object.fromEntries(stops.map((s) => [s.id, s]));
  const orderedStops = order.map((p, idx) => ({ ...byId[p.id], optimizedSequence: idx + 1 }));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-brand-900">Route Map &mdash; All My Areas</h1>
      <p className="mb-6 text-sm text-brand-700">
        Covering: {profile?.areas.length ? profile.areas.map((a) => a.name).join(", ") : "No areas assigned"}.
        This combines every pending/scheduled stop across all your assigned areas into one shortest-path route from
        the depot.
      </p>

      <DriverAreaMap
        depot={depot}
        stops={orderedStops.map((s) => ({
          id: s.id!,
          lat: s.deliveryRequest!.lat,
          lng: s.deliveryRequest!.lng,
          label: `${s.deliveryRequest!.customer.name} (${s.deliveryRequest!.area?.name ?? "Unassigned area"})`,
          sequence: s.optimizedSequence,
          delivered: false,
        }))}
      />

      <p className="mt-3 text-sm text-brand-700">Estimated total distance: {totalDistanceKm.toFixed(1)} km</p>

      <div className="mt-6 flex flex-col gap-3">
        {orderedStops.map((s) => (
          <div key={s.id} className="card flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
            <span>
              #{s.optimizedSequence} &mdash; {s.deliveryRequest!.customer.name} &mdash; {s.deliveryRequest!.address}
            </span>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {s.deliveryRequest!.area?.name ?? "Unassigned area"}
            </span>
          </div>
        ))}
        {orderedStops.length === 0 && <p className="text-sm text-brand-700">No pending stops across your areas right now.</p>}
      </div>
    </div>
  );
}
