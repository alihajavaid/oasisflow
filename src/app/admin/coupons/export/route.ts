import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildExcelResponse } from "@/lib/excel";

export async function GET() {
  await requireUser(["ADMIN"]);

  const books = await prisma.couponBook.findMany({
    include: { customer: true, type: true, coupons: true },
    orderBy: { purchasedAt: "desc" },
  });

  return buildExcelResponse("oasisflow-coupon-books.xlsx", [
    {
      name: "Coupon Books",
      columns: [
        { header: "Customer", key: "customer", width: 26 },
        { header: "Email", key: "email", width: 28 },
        { header: "Book Type", key: "type", width: 30 },
        { header: "Total Coupons", key: "total", width: 14 },
        { header: "Remaining", key: "remaining", width: 12 },
        { header: "Used", key: "used", width: 10 },
        { header: "Purchased", key: "purchased", width: 16 },
      ],
      rows: books.map((b) => ({
        customer: b.customer.name,
        email: b.customer.email,
        type: b.type.name,
        total: b.totalCoupons,
        remaining: b.remainingCoupons,
        used: b.totalCoupons - b.remainingCoupons,
        purchased: b.purchasedAt.toISOString().slice(0, 10),
      })),
    },
    {
      name: "Coupon Codes",
      columns: [
        { header: "Code", key: "code", width: 18 },
        { header: "Customer", key: "customer", width: 26 },
        { header: "Book Type", key: "type", width: 28 },
        { header: "Status", key: "status", width: 12 },
        { header: "Used At", key: "usedAt", width: 16 },
      ],
      rows: books.flatMap((b) =>
        b.coupons.map((c) => ({
          code: c.code,
          customer: b.customer.name,
          type: b.type.name,
          status: c.status,
          usedAt: c.usedAt ? c.usedAt.toISOString().slice(0, 10) : "",
        }))
      ),
    },
  ]);
}
