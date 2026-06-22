import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/content", label: "Website Content" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/coupons", label: "Coupon Books" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/messages", label: "Bulk WhatsApp" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/areas", label: "Areas" },
  { href: "/admin/drivers", label: "Drivers" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/routes", label: "Routes" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/finance", label: "Finance" },
  { href: "/admin/payroll", label: "Payroll" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#f3f7fa]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-brand-100 bg-white p-4 md:flex">
        <Link href="/" className="mb-6 px-2 text-lg font-bold text-brand-900">OasisFlow Admin</Link>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button type="submit" className="btn-secondary mt-4 w-full">Log out</button>
        </form>
      </aside>
      <div className="flex-1 overflow-x-hidden">
        <header className="border-b border-brand-100 bg-white px-4 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-bold text-brand-900">OasisFlow Admin</span>
            <form action={logout}>
              <button type="submit" className="btn-secondary">Log out</button>
            </form>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="p-6">
          <p className="mb-4 text-sm text-brand-700">Signed in as {user.name}</p>
          {children}
        </main>
      </div>
    </div>
  );
}
