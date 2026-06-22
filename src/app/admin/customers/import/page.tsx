import { CustomerImportForm } from "@/components/CustomerImportForm";
import { BASE_PATH } from "@/lib/constants";

export default function AdminCustomerImportPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Import Existing Customers</h1>
        <a href={`${BASE_PATH}/admin/customers/import-template`} className="btn-secondary">Download Template</a>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-brand-700">
        Bring in customers you already had before this system &mdash; including their current coupon book balance
        from physical coupon books. Download the template, fill one row per customer, and upload it below. Matching
        is by email: existing accounts are updated, new ones are created with a temporary password.
      </p>
      <ul className="mb-6 list-disc pl-5 text-sm text-brand-700">
        <li><strong>Name, Email</strong> are required.</li>
        <li><strong>CouponBookCode</strong> must match an existing coupon book type code (e.g. CB-17) &mdash; see the Coupon Books page. Leave blank if the customer has no active coupon book.</li>
        <li><strong>TotalCoupons</strong> overrides the type&apos;s default size if this customer&apos;s physical book is a different size. Leave blank to use the type&apos;s default.</li>
        <li><strong>RemainingCoupons</strong> is how many coupons are left unused in their physical book right now. Leave blank to assume the whole book is unused.</li>
      </ul>

      <CustomerImportForm />
    </div>
  );
}
