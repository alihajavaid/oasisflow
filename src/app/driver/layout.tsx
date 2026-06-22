import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

const tabs = [
  { href: "/driver", label: "My Deliveries" },
  { href: "/driver/map", label: "Route Map" },
  { href: "/driver/attendance", label: "Attendance" },
  { href: "/driver/salary", label: "Salary" },
];

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DRIVER") redirect("/login");

  return (
    <div className="min-h-screen bg-[#f3f7fa]">
      <header className="flex items-center justify-between border-b border-brand-100 bg-white px-6 py-4">
        <div>
          <p className="font-bold text-brand-900">OasisFlow Driver</p>
          <p className="text-xs text-brand-700">{user.name}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="btn-secondary">Log out</button>
        </form>
      </header>
      <nav className="flex gap-2 overflow-x-auto border-b border-brand-100 bg-white px-6 py-2">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50">
            {t.label}
          </Link>
        ))}
      </nav>
      <main className="container-page py-6">{children}</main>
    </div>
  );
}
