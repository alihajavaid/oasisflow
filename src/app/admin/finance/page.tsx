import { prisma } from "@/lib/prisma";
import { createExpense } from "@/lib/actions/admin/finance";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({ where: { paymentStatus: "PAID" } }),
    prisma.expense.findMany({ orderBy: { date: "desc" }, take: 50 }),
  ]);

  const revenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = revenue - totalExpenses;

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">Finance</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-brand-700">Revenue Collected</p>
          <p className="mt-2 text-2xl font-bold text-brand-900">AED {revenue.toFixed(2)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-brand-700">Total Expenses</p>
          <p className="mt-2 text-2xl font-bold text-brand-900">AED {totalExpenses.toFixed(2)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-brand-700">Net</p>
          <p className={`mt-2 text-2xl font-bold ${netProfit >= 0 ? "text-accent" : "text-red-600"}`}>AED {netProfit.toFixed(2)}</p>
        </div>
      </div>

      <form action={createExpense} className="card mb-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" name="category" placeholder="Category (fuel, salaries, supplies...)" required />
        <input className="input" name="amount" type="number" step="0.01" placeholder="Amount (AED)" required />
        <input className="input" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        <input className="input" name="description" placeholder="Description (optional)" />
        <button type="submit" className="btn-primary lg:col-span-4">Log Expense</button>
      </form>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 font-semibold text-brand-900">Expenses by Category</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {Object.entries(byCategory).map(([cat, amt]) => (
              <li key={cat} className="card flex justify-between p-3">
                <span>{cat}</span>
                <span className="font-medium text-brand-900">AED {amt.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-brand-900">Recent Expenses</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {expenses.map((e) => (
              <li key={e.id} className="card flex justify-between p-3">
                <span>{e.category} {e.description ? `– ${e.description}` : ""} ({e.date.toLocaleDateString()})</span>
                <span className="font-medium text-brand-900">AED {e.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
