import { prisma } from "@/lib/prisma";
import { createArea } from "@/lib/actions/admin/areas";

export const dynamic = "force-dynamic";

export default async function AdminAreasPage() {
  const areas = await prisma.deliveryArea.findMany({
    include: { drivers: { include: { user: true } }, _count: { select: { customers: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">Delivery Areas</h1>
      <form action={createArea} className="card mb-8 flex flex-wrap gap-3 p-5">
        <input className="input max-w-xs" name="name" placeholder="Area name" required />
        <input className="input flex-1" name="description" placeholder="Description (optional)" />
        <button type="submit" className="btn-primary">Add Area</button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((a) => (
          <div key={a.id} className="card p-4">
            <p className="font-semibold text-brand-900">{a.name}</p>
            <p className="text-sm text-brand-700">{a.description}</p>
            <p className="mt-2 text-xs text-brand-700">{a._count.customers} pending stops requested</p>
            <p className="text-xs text-brand-700">
              Drivers: {a.drivers.length === 0 ? "None assigned" : a.drivers.map((d) => d.user.name).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
