import { prisma } from "@/lib/prisma";
import { markAttendance } from "@/lib/actions/admin/attendance";

export const dynamic = "force-dynamic";

function toDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? toDateOnly(new Date(dateParam)) : toDateOnly(new Date());
  const dateStr = date.toISOString().slice(0, 10);

  const [profiles, todaysAttendance, history] = await Promise.all([
    prisma.driverProfile.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
    prisma.attendance.findMany({ where: { date } }),
    prisma.attendance.findMany({
      include: { driver: { include: { user: true } } },
      orderBy: { date: "desc" },
      take: 40,
    }),
  ]);

  const statusByDriver = Object.fromEntries(todaysAttendance.map((a) => [a.driverId, a.status]));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">Driver Attendance</h1>

      <form method="get" className="mb-6 flex items-center gap-3">
        <label className="label !mb-0">Date</label>
        <input className="input w-44" type="date" name="date" defaultValue={dateStr} />
        <button type="submit" className="btn-secondary">View / Mark</button>
      </form>

      <form action={markAttendance} className="card flex flex-col gap-3 p-5">
        <input type="hidden" name="date" value={dateStr} />
        <h2 className="font-semibold text-brand-900">Mark Attendance for {dateStr}</h2>
        {profiles.length === 0 && <p className="text-sm text-brand-700">No drivers yet.</p>}
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 border-t border-brand-100 pt-3 text-sm first:border-t-0 first:pt-0">
            <input type="hidden" name="driverProfileId" value={p.id} />
            <span className="font-medium text-brand-900">{p.user.name}</span>
            <select name={`status_${p.id}`} defaultValue={statusByDriver[p.id] ?? "PRESENT"} className="input w-40 py-1 text-xs">
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">On Leave</option>
            </select>
          </div>
        ))}
        {profiles.length > 0 && <button type="submit" className="btn-primary mt-2 self-start">Save Attendance</button>}
      </form>

      <h2 className="mb-3 mt-10 font-semibold text-brand-900">Recent Attendance History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-700">
              <th className="p-2">Driver</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((a) => (
              <tr key={a.id} className="border-t border-brand-100">
                <td className="p-2 font-medium text-brand-900">{a.driver.user.name}</td>
                <td className="p-2">{a.date.toLocaleDateString()}</td>
                <td className="p-2">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
