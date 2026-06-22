import { prisma } from "@/lib/prisma";
import { createDriver, updateDriverAreas } from "@/lib/actions/admin/drivers";
import { toggleUserActive } from "@/lib/actions/admin/users";
import { BASE_PATH } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDriversPage() {
  const [drivers, areas] = await Promise.all([
    prisma.user.findMany({ where: { role: "DRIVER" }, include: { driverProfile: { include: { areas: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.deliveryArea.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Drivers</h1>
        <a href={`${BASE_PATH}/admin/drivers/export`} className="btn-secondary">Export to Excel</a>
      </div>

      <form action={createDriver} className="card mb-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <input className="input" name="name" placeholder="Full name" required />
        <input className="input" name="email" type="email" placeholder="Login email" required />
        <input className="input" name="phone" placeholder="Phone" required />
        <input className="input" name="password" type="password" placeholder="Temporary password" required />
        <input className="input" name="vehicleInfo" placeholder="Vehicle info" />
        <input className="input" name="licenseNo" placeholder="License No." />
        <input className="input" name="baseSalary" type="number" step="0.01" placeholder="Base salary (AED/month)" required />
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="label">Assign Areas (a driver can cover more than one)</p>
          <div className="flex flex-wrap gap-3 rounded-lg border border-brand-100 p-3">
            {areas.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="areaIds" value={a.id} />
                {a.name}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-3">Create Driver Login</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-700">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Areas</th>
              <th className="p-2">Base Salary</th>
              <th className="p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-t border-brand-100">
                <td className="p-2 font-medium text-brand-900">{d.name}</td>
                <td className="p-2">{d.email}</td>
                <td className="p-2">
                  {d.driverProfile && (
                    <form action={updateDriverAreas} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="driverProfileId" value={d.driverProfile.id} />
                      {areas.map((a) => (
                        <label key={a.id} className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            name="areaIds"
                            value={a.id}
                            defaultChecked={d.driverProfile!.areas.some((da) => da.id === a.id)}
                          />
                          {a.name}
                        </label>
                      ))}
                      <button type="submit" className="btn-secondary px-2 py-1 text-xs">Save</button>
                    </form>
                  )}
                </td>
                <td className="p-2">AED {d.driverProfile?.baseSalary.toFixed(2) ?? "-"}</td>
                <td className="p-2">{d.active ? "Active" : "Suspended"}</td>
                <td className="p-2">
                  <form action={toggleUserActive}>
                    <input type="hidden" name="id" value={d.id} />
                    <button type="submit" className="btn-secondary px-3 py-1 text-xs">{d.active ? "Suspend" : "Reactivate"}</button>
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
