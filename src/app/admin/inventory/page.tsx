import { prisma } from "@/lib/prisma";
import { createInventoryItem, adjustInventory } from "@/lib/actions/admin/inventory";
import { BASE_PATH } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const items = await prisma.inventoryItem.findMany({
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Inventory</h1>
        <a href={`${BASE_PATH}/admin/inventory/export`} className="btn-secondary">Export to Excel</a>
      </div>

      <form action={createInventoryItem} className="card mb-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <input className="input" name="name" placeholder="Item name" required />
        <input className="input" name="sku" placeholder="SKU" required />
        <input className="input" name="unit" placeholder="Unit (bottle, unit, kg...)" required />
        <input className="input" name="quantity" type="number" placeholder="Starting quantity" required />
        <input className="input" name="reorderLevel" type="number" placeholder="Reorder level" required />
        <input className="input" name="costPerUnit" type="number" step="0.01" placeholder="Cost per unit (AED)" required />
        <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-3">Add Inventory Item</button>
      </form>

      <div className="flex flex-col gap-4">
        {items.map((i) => {
          const low = i.quantity <= i.reorderLevel;
          return (
            <div key={i.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-brand-900">{i.name} <span className="text-xs text-brand-700">({i.sku})</span></p>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${low ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700"}`}>
                  {i.quantity} {i.unit} in stock
                </span>
              </div>
              <form action={adjustInventory} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="itemId" value={i.id} />
                <select name="type" className="input py-1 text-xs">
                  <option value="IN">Stock In</option>
                  <option value="OUT">Stock Out</option>
                </select>
                <input className="input w-24 py-1 text-xs" name="quantity" type="number" min={1} placeholder="Qty" required />
                <input className="input flex-1 py-1 text-xs" name="reason" placeholder="Reason (e.g. delivered, restock)" />
                <button type="submit" className="btn-secondary px-3 py-1 text-xs">Record</button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
