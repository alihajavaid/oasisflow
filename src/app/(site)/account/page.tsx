import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [books, recentOrders, pendingDeliveries] = await Promise.all([
    prisma.couponBook.findMany({ where: { customerId: user.id }, include: { type: true } }),
    prisma.order.findMany({ where: { customerId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.deliveryRequest.count({ where: { customerId: user.id, status: { in: ["REQUESTED", "SCHEDULED", "OUT_FOR_DELIVERY"] } } }),
  ]);

  const totalRemaining = books.reduce((sum, b) => sum + b.remainingCoupons, 0);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="card p-6">
        <p className="text-sm text-brand-700">Coupons Remaining</p>
        <p className="mt-2 text-3xl font-bold text-brand-900">{totalRemaining}</p>
        <Link href="/account/coupons" className="mt-3 inline-block text-sm font-semibold text-brand-500">View coupon books &rarr;</Link>
      </div>
      <div className="card p-6">
        <p className="text-sm text-brand-700">Pending Deliveries</p>
        <p className="mt-2 text-3xl font-bold text-brand-900">{pendingDeliveries}</p>
        <Link href="/account/schedule" className="mt-3 inline-block text-sm font-semibold text-brand-500">Manage schedule &rarr;</Link>
      </div>
      <div className="card p-6">
        <p className="text-sm text-brand-700">Recent Orders</p>
        <p className="mt-2 text-3xl font-bold text-brand-900">{recentOrders.length}</p>
        <Link href="/account/orders" className="mt-3 inline-block text-sm font-semibold text-brand-500">View order history &rarr;</Link>
      </div>

      <div className="card col-span-full p-6">
        <h2 className="mb-4 font-semibold text-brand-900">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-brand-700">No orders yet. <Link href="/products" className="text-brand-500">Shop now</Link>.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between border-b border-brand-100 pb-2 text-sm">
                <span>Order #{o.id.slice(-6).toUpperCase()}</span>
                <span className="text-brand-700">AED {o.totalAmount.toFixed(2)}</span>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{o.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
