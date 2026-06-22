import { prisma } from "@/lib/prisma";
import { createRoute } from "@/lib/actions/admin/routes";

export const dynamic = "force-dynamic";

export default async function AdminRoutesPage() {
  const [pending, drivers, routes] = await Promise.all([
    prisma.deliveryRequest.findMany({ where: { status: "REQUESTED" }, include: { customer: true, area: true }, orderBy: { createdAt: "asc" } }),
    prisma.user.findMany({ where: { role: "DRIVER", active: true }, include: { driverProfile: { include: { areas: true } } } }),
    prisma.route.findMany({
      include: { driver: true, stops: { include: { deliveryRequest: { include: { customer: true } } } } },
      orderBy: { date: "desc" },
      take: 15,
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">Routes &amp; Dispatch</h1>

      <form action={createRoute} className="card mb-10 flex flex-col gap-4 p-5">
        <h2 className="font-semibold text-brand-900">Create a Route</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <select name="driverId" className="input" required>
            <option value="">Select driver</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.driverProfile?.areas.length ? `(${d.driverProfile.areas.map((a) => a.name).join(", ")})` : ""}
              </option>
            ))}
          </select>
          <input className="input" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>

        <div>
          <p className="label">
            Pending Delivery Requests (a single route can combine stops from several areas &mdash; the optimizer
            sequences all selected stops together regardless of area)
          </p>
          {pending.length === 0 && <p className="text-sm text-brand-700">No pending requests right now.</p>}
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-lg border border-brand-100 p-3">
            {pending.map((r) => (
              <label key={r.id} className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="requestIds" value={r.id} />
                <span>
                  {r.customer.name} &mdash; {r.bottlesQty} bottle(s) &mdash; {r.address}
                  {r.area && <span className="ml-1 text-xs text-brand-500">[{r.area.name}]</span>}
                  {r.couponBookId && <span className="ml-1 text-xs text-accent">(coupon book)</span>}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary self-start">Create Optimized Route</button>
        <p className="text-xs text-brand-700">
          Stop order is automatically optimized (nearest-neighbor + 2-opt) starting from the OasisFlow depot.
        </p>
      </form>

      <h2 className="mb-3 font-semibold text-brand-900">Recent Routes</h2>
      <div className="flex flex-col gap-4">
        {routes.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-brand-900">{r.driver.name} &mdash; {r.date.toLocaleDateString()}</p>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{r.status}</span>
              {r.totalDistanceKm != null && <span className="text-xs text-brand-700">{r.totalDistanceKm.toFixed(1)} km</span>}
            </div>
            <ol className="mt-2 list-decimal pl-5 text-sm text-brand-700">
              {r.stops.sort((a, b) => a.sequence - b.sequence).map((s) => (
                <li key={s.id}>
                  {s.deliveryRequest.customer.name} &mdash; {s.deliveryRequest.address} &middot; {s.status}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
