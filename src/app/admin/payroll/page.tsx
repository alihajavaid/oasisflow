import { prisma } from "@/lib/prisma";
import { generatePayroll, markPayrollPaid } from "@/lib/actions/admin/payroll";

export const dynamic = "force-dynamic";

export default async function AdminPayrollPage() {
  const [profiles, records] = await Promise.all([
    prisma.driverProfile.findMany({ include: { user: true } }),
    prisma.payrollRecord.findMany({ include: { driver: { include: { user: true } } }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  const currentPeriod = new Date().toISOString().slice(0, 7);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">Driver Payroll</h1>

      <form action={generatePayroll} className="card mb-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <select name="driverId" className="input" required>
          <option value="">Select driver</option>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.user.name} (base AED {p.baseSalary.toFixed(2)})</option>)}
        </select>
        <input className="input" name="period" type="month" defaultValue={currentPeriod} required />
        <input className="input" name="bonus" type="number" step="0.01" placeholder="Bonus (AED)" defaultValue={0} />
        <input className="input" name="deductions" type="number" step="0.01" placeholder="Deductions (AED)" defaultValue={0} />
        <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-4">Generate Payslip</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-700">
              <th className="p-2">Driver</th>
              <th className="p-2">Period</th>
              <th className="p-2">Base</th>
              <th className="p-2">Bonus</th>
              <th className="p-2">Deductions</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t border-brand-100">
                <td className="p-2 font-medium text-brand-900">{r.driver.user.name}</td>
                <td className="p-2">{r.period}</td>
                <td className="p-2">AED {r.baseSalary.toFixed(2)}</td>
                <td className="p-2">AED {r.bonus.toFixed(2)}</td>
                <td className="p-2">AED {r.deductions.toFixed(2)}</td>
                <td className="p-2 font-semibold">AED {r.totalPaid.toFixed(2)}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">
                  {r.status === "PENDING" && (
                    <form action={markPayrollPaid}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="btn-secondary px-3 py-1 text-xs">Mark Paid</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
