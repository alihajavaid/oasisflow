import { requireUser } from "@/lib/auth";
import { buildExcelResponse } from "@/lib/excel";

export async function GET() {
  await requireUser(["ADMIN"]);

  return buildExcelResponse("oasisflow-customer-import-template.xlsx", [
    {
      name: "Customers",
      columns: [
        { header: "Name", key: "name", width: 24 },
        { header: "Email", key: "email", width: 28 },
        { header: "Phone", key: "phone", width: 16 },
        { header: "Address", key: "address", width: 36 },
        { header: "CouponBookCode", key: "couponBookCode", width: 18 },
        { header: "TotalCoupons", key: "totalCoupons", width: 14 },
        { header: "RemainingCoupons", key: "remainingCoupons", width: 16 },
      ],
      rows: [
        {
          name: "Fatimah Al Mansoori",
          email: "fatimah.example@example.com",
          phone: "0559998877",
          address: "Villa 12, Street 4, Mussafah, Abu Dhabi",
          couponBookCode: "CB-17",
          totalCoupons: 17,
          remainingCoupons: 12,
        },
        {
          name: "Hassan Raza (no coupon book)",
          email: "hassan.example@example.com",
          phone: "0553334455",
          address: "Corniche Road, Abu Dhabi",
          couponBookCode: "",
          totalCoupons: "",
          remainingCoupons: "",
        },
      ],
    },
  ]);
}
