import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [customers, drivers, orders, pendingDeliveries, revenue, expenses, lowStock, openFeedback] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "DRIVER" } }),
    prisma.order.count(),
    prisma.deliveryRequest.count({ where: { status: { in: ["REQUESTED", "SCHEDULED"] } } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.inventoryItem.findMany({ where: { quantity: { lt: 9999999 } } }).then((items) => items.filter((i) => i.quantity <= i.reorderLevel)),
    prisma.feedback.count({ where: { response: null } }),
  ]);

  const cards = [
    { label: "Customers", value: customers },
    { label: "Active Drivers", value: drivers },
    { label: "Total Orders", value: orders },
    { label: "Pending Deliveries", value: pendingDeliveries },
    { label: "Revenue Collected (AED)", value: (revenue._sum.totalAmount ?? 0).toFixed(2) },
    { label: "Total Expenses (AED)", value: (expenses._sum.amount ?? 0).toFixed(2) },
    { label: "Low Stock Items", value: lowStock.length },
    { label: "Feedback Awaiting Reply", value: openFeedback },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-brand-700">{c.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-900">{c.value}</p>
          </div>
        ))}
      </div>
      {lowStock.length > 0 && (
        <div className="card mt-6 p-5">
          <h2 className="mb-3 font-semibold text-brand-900">Low Stock Alerts</h2>
          <ul className="text-sm text-brand-700">
            {lowStock.map((i) => (
              <li key={i.id}>{i.name}: {i.quantity} {i.unit} left (reorder at {i.reorderLevel})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
