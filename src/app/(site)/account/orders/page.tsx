import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ placed?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { placed } = await searchParams;

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true, couponBookType: true } } },
  });

  return (
    <div>
      {placed && (
        <div className="mb-6 rounded-lg bg-accent/10 p-4 text-sm text-accent">
          Order placed successfully! Our team will confirm and schedule delivery soon.
        </div>
      )}
      <h2 className="mb-4 text-lg font-semibold text-brand-900">Order History</h2>
      <div className="flex flex-col gap-4">
        {orders.length === 0 && <p className="text-sm text-brand-700">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-brand-900">Order #{o.id.slice(-6).toUpperCase()}</p>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{o.status}</span>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{o.paymentStatus}</span>
            </div>
            <p className="mt-1 text-xs text-brand-700">{o.createdAt.toLocaleString()}</p>
            <ul className="mt-3 flex flex-col gap-1 text-sm text-brand-700">
              {o.items.map((it) => (
                <li key={it.id}>
                  {it.quantity} x {it.product?.name ?? it.couponBookType?.name} &mdash; AED {(it.price * it.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-semibold text-brand-900">Total: AED {o.totalAmount.toFixed(2)}</p>
            <p className="mt-1 text-xs text-brand-700">Deliver to: {o.deliveryAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
