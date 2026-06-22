import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { RequestDeliveryForm } from "@/components/RequestDeliveryForm";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [requests, books] = await Promise.all([
    prisma.deliveryRequest.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { stop: { include: { route: { include: { driver: true } } } } },
    }),
    prisma.couponBook.findMany({ where: { customerId: user.id, remainingCoupons: { gt: 0 } }, include: { type: true } }),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Delivery Schedule</h2>
        <div className="flex flex-col gap-3">
          {requests.length === 0 && <p className="text-sm text-brand-700">No delivery requests yet.</p>}
          {requests.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <div>
                <p className="font-medium text-brand-900">{r.bottlesQty} bottle(s) &mdash; {r.address}</p>
                <p className="text-brand-700">Requested {r.requestedDate.toLocaleDateString()}</p>
                {r.stop?.route?.driver && <p className="text-brand-700">Driver: {r.stop.route.driver.name}</p>}
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{r.status}</span>
            </div>
          ))}
        </div>
      </div>
      <RequestDeliveryForm
        books={books.map((b) => ({ id: b.id, remainingCoupons: b.remainingCoupons, typeName: b.type.name }))}
        defaultAddress={user.address ?? ""}
      />
    </div>
  );
}
