import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { createCouponBookType, toggleCouponBookTypeActive, deleteCouponBookType } from "@/lib/actions/admin/coupons";
import { BASE_PATH, resolveImageSrc } from "@/lib/constants";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const [types, books] = await Promise.all([
    prisma.couponBookType.findMany({ orderBy: { totalCoupons: "asc" } }),
    prisma.couponBook.findMany({
      include: { customer: true, type: true, coupons: true },
      orderBy: { purchasedAt: "desc" },
      take: 25,
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Coupon Books</h1>
        <a href={`${BASE_PATH}/admin/coupons/export`} className="btn-secondary">Export to Excel</a>
      </div>

      <form action={createCouponBookType} encType="multipart/form-data" className="card mb-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <input className="input" name="code" placeholder="Code (e.g. CB-50)" required />
        <input className="input" name="name" placeholder="Display name" required />
        <input className="input" name="totalCoupons" type="number" placeholder="Total coupons" required />
        <input className="input" name="price" type="number" step="0.01" placeholder="Price (AED)" required />
        <input className="input" name="perks" placeholder="Perks (optional)" />
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="label">Coupon Book Image &mdash; upload a file OR paste a URL (upload takes priority)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" name="imageFile" type="file" accept="image/*" />
            <input className="input" name="imageUrl" placeholder="Or paste an image URL" />
          </div>
        </div>
        <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-3">Add Coupon Book Type</button>
      </form>

      <h2 className="mb-3 font-semibold text-brand-900">Coupon Book Types</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-700">
              <th className="p-2">Image</th>
              <th className="p-2">Code</th>
              <th className="p-2">Name</th>
              <th className="p-2">Coupons</th>
              <th className="p-2">Price</th>
              <th className="p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} className="border-t border-brand-100">
                <td className="p-2"><Image src={resolveImageSrc(t.imageUrl)} alt={t.name} width={36} height={36} className="h-9 w-9 object-contain" /></td>
                <td className="p-2">{t.code}</td>
                <td className="p-2 font-medium text-brand-900">{t.name}</td>
                <td className="p-2">{t.totalCoupons}</td>
                <td className="p-2">AED {t.price.toFixed(2)}</td>
                <td className="p-2">{t.active ? "Active" : "Hidden"}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <form action={toggleCouponBookTypeActive}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="btn-secondary px-3 py-1 text-xs">{t.active ? "Hide" : "Activate"}</button>
                    </form>
                    <form action={deleteCouponBookType}>
                      <input type="hidden" name="id" value={t.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Permanently delete "${t.name}" (${t.code})? This can't be undone.`}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-10 font-semibold text-brand-900">Recently Issued Coupon Books</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-700">
              <th className="p-2">Customer</th>
              <th className="p-2">Type</th>
              <th className="p-2">Remaining</th>
              <th className="p-2">Purchased</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id} className="border-t border-brand-100">
                <td className="p-2">{b.customer.name} ({b.customer.email})</td>
                <td className="p-2">{b.type.name}</td>
                <td className="p-2">{b.remainingCoupons} / {b.totalCoupons}</td>
                <td className="p-2">{b.purchasedAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
