import { prisma } from "@/lib/prisma";
import { toggleUserActive } from "@/lib/actions/admin/users";
import { BASE_PATH } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { couponBooks: true, orders: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Customers</h1>
        <div className="flex gap-2">
          <a href={`${BASE_PATH}/admin/customers/import`} className="btn-primary">Import Customers</a>
          <a href={`${BASE_PATH}/admin/customers/export`} className="btn-secondary">Export to Excel</a>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-700">
              <th className="p-2">Name</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Orders</th>
              <th className="p-2">Coupons Remaining</th>
              <th className="p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-brand-100">
                <td className="p-2 font-medium text-brand-900">{c.name}</td>
                <td className="p-2">{c.email}<br /><span className="text-xs text-brand-700">{c.phone}</span></td>
                <td className="p-2">{c.orders.length}</td>
                <td className="p-2">{c.couponBooks.reduce((s, b) => s + b.remainingCoupons, 0)}</td>
                <td className="p-2">{c.active ? "Active" : "Suspended"}</td>
                <td className="p-2">
                  <form action={toggleUserActive}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="btn-secondary px-3 py-1 text-xs">
                      {c.active ? "Suspend" : "Reactivate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
