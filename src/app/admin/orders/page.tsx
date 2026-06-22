import { prisma } from "@/lib/prisma";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/actions/admin/orders";
import { BASE_PATH } from "@/lib/constants";

export const dynamic = "force-dynamic";

const orderStatuses = ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const paymentStatuses = ["UNPAID", "PAID", "REFUNDED"];

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: { include: { product: true, couponBookType: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Orders</h1>
        <a href={`${BASE_PATH}/admin/orders/export`} className="btn-secondary">Export to Excel</a>
      </div>
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <div key={o.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-brand-900">Order #{o.id.slice(-6).toUpperCase()} &mdash; {o.customer.name}</p>
                <p className="text-xs text-brand-700">{o.createdAt.toLocaleString()} &middot; {o.deliveryAddress}</p>
              </div>
              <div className="flex gap-2">
                <form action={updateOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <select name="status" defaultValue={o.status} className="input py-1 text-xs">
                    {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="submit" className="btn-secondary px-2 py-1 text-xs">Update</button>
                </form>
                <form action={updatePaymentStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <select name="paymentStatus" defaultValue={o.paymentStatus} className="input py-1 text-xs">
                    {paymentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="submit" className="btn-secondary px-2 py-1 text-xs">Update</button>
                </form>
              </div>
            </div>
            <ul className="mt-3 text-sm text-brand-700">
              {o.items.map((it) => (
                <li key={it.id}>{it.quantity} x {it.product?.name ?? it.couponBookType?.name} &mdash; AED {(it.price * it.quantity).toFixed(2)}</li>
              ))}
            </ul>
            <p className="mt-2 font-semibold text-brand-900">Total: AED {o.totalAmount.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
