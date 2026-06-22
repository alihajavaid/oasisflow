import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildExcelResponse } from "@/lib/excel";

export async function GET() {
  await requireUser(["ADMIN"]);

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { couponBooks: true, orders: true },
    orderBy: { createdAt: "desc" },
  });

  return buildExcelResponse("oasisflow-customers.xlsx", [
    {
      name: "Customers",
      columns: [
        { header: "Name", key: "name", width: 26 },
        { header: "Email", key: "email", width: 28 },
        { header: "Phone", key: "phone", width: 18 },
        { header: "Address", key: "address", width: 36 },
        { header: "Orders", key: "orders", width: 10 },
        { header: "Coupons Remaining", key: "coupons", width: 18 },
        { header: "Status", key: "status", width: 12 },
        { header: "Joined", key: "joined", width: 16 },
      ],
      rows: customers.map((c) => ({
        name: c.name,
        email: c.email,
        phone: c.phone ?? "",
        address: c.address ?? "",
        orders: c.orders.length,
        coupons: c.couponBooks.reduce((s, b) => s + b.remainingCoupons, 0),
        status: c.active ? "Active" : "Suspended",
        joined: c.createdAt.toISOString().slice(0, 10),
      })),
    },
  ]);
}
