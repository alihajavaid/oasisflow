import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

const tabs = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/coupons", label: "Coupon Books" },
  { href: "/account/schedule", label: "Delivery Schedule" },
  { href: "/account/feedback", label: "Feedback" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") redirect("/login");

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Welcome, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-brand-700">{user.email}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="btn-secondary">Log out</button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-brand-100 pb-3">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-full px-4 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50">
            {t.label}
          </Link>
        ))}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
