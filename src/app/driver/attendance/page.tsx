import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DriverAttendancePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.driverProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return <p className="text-sm text-brand-700">No driver profile found.</p>;

  const records = await prisma.attendance.findMany({
    where: { driverId: profile.id },
    orderBy: { date: "desc" },
    take: 60,
  });

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const leaveCount = records.filter((r) => r.status === "LEAVE").length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">My Attendance</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-brand-700">Present Days</p>
          <p className="mt-1 text-2xl font-bold text-accent">{presentCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-brand-700">Absent Days</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{absentCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-brand-700">Leave Days</p>
          <p className="mt-1 text-2xl font-bold text-brand-900">{leaveCount}</p>
        </div>
      </div>

      <h2 className="mb-3 font-semibold text-brand-900">History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-700">
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t border-brand-100">
                <td className="p-2">{r.date.toLocaleDateString()}</td>
                <td className="p-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      r.status === "PRESENT" ? "bg-accent/10 text-accent" : r.status === "ABSENT" ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={2} className="p-2 text-brand-700">No attendance records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
