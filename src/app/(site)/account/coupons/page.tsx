import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CustomerCouponsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const books = await prisma.couponBook.findMany({
    where: { customerId: user.id },
    include: { type: true, coupons: { orderBy: { id: "asc" } } },
    orderBy: { purchasedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-brand-900">Your Coupon Books</h2>
      {books.length === 0 && <p className="text-sm text-brand-700">You have not purchased any coupon books yet.</p>}
      {books.map((b) => {
        const used = b.totalCoupons - b.remainingCoupons;
        const pct = Math.round((used / b.totalCoupons) * 100);
        return (
          <div key={b.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-brand-900">{b.type.name}</p>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{b.status}</span>
            </div>
            <p className="mt-1 text-sm text-brand-700">
              {b.remainingCoupons} of {b.totalCoupons} coupons remaining
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100">
              <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-brand-500">View coupon codes</summary>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {b.coupons.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-md border px-2 py-1 text-center text-xs font-mono ${
                      c.status === "USED" ? "border-brand-100 bg-brand-50 text-brand-400 line-through" : "border-accent/30 bg-accent/10 text-brand-900"
                    }`}
                  >
                    {c.code}
                  </div>
                ))}
              </div>
            </details>
          </div>
        );
      })}
    </div>
  );
}
