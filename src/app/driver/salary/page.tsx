import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DriverSalaryPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.driverProfile.findUnique({
    where: { userId: user.id },
    include: { payrolls: { orderBy: { period: "desc" } } },
  });

  if (!profile) {
    return <p className="text-sm text-brand-700">No driver profile found.</p>;
  }

  const latest = profile.payrolls[0];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">My Salary</h1>

      <div className="card mb-8 p-5">
        <p className="text-sm text-brand-700">Base Monthly Salary</p>
        <p className="mt-1 text-2xl font-bold text-brand-900">AED {profile.baseSalary.toFixed(2)}</p>
        {latest ? (
          <p className="mt-3 text-sm">
            Latest payslip ({latest.period}):{" "}
            <span className={latest.status === "PAID" ? "font-semibold text-accent" : "font-semibold text-red-600"}>
              {latest.status === "PAID" ? "Paid" : "Not Paid Yet"}
            </span>
          </p>
        ) : (
          <p className="mt-3 text-sm text-brand-700">No payslips generated yet.</p>
        )}
      </div>

      <h2 className="mb-3 font-semibold text-brand-900">Payslip History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-700">
              <th className="p-2">Period</th>
              <th className="p-2">Base</th>
              <th className="p-2">Bonus</th>
              <th className="p-2">Deductions</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {profile.payrolls.map((p) => (
              <tr key={p.id} className="border-t border-brand-100">
                <td className="p-2 font-medium text-brand-900">{p.period}</td>
                <td className="p-2">AED {p.baseSalary.toFixed(2)}</td>
                <td className="p-2">AED {p.bonus.toFixed(2)}</td>
                <td className="p-2">AED {p.deductions.toFixed(2)}</td>
                <td className="p-2 font-semibold">AED {p.totalPaid.toFixed(2)}</td>
                <td className="p-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${p.status === "PAID" ? "bg-accent/10 text-accent" : "bg-red-100 text-red-700"}`}>
                    {p.status === "PAID" ? "Paid" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
            {profile.payrolls.length === 0 && (
              <tr><td colSpan={6} className="p-2 text-brand-700">No payslips yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
