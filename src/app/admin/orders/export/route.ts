import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildExcelResponse } from "@/lib/excel";

export async function GET() {
  await requireUser(["ADMIN"]);

  const orders = await prisma.order.findMany({
    include: { customer: true, items: { include: { product: true, couponBookType: true } } },
    orderBy: { createdAt: "desc" },
  });

  return buildExcelResponse("oasisflow-orders.xlsx", [
    {
      name: "Orders",
      columns: [
        { header: "Order ID", key: "id", width: 14 },
        { header: "Customer", key: "customer", width: 26 },
        { header: "Items", key: "items", width: 40 },
        { header: "Total (AED)", key: "total", width: 14 },
        { header: "Status", key: "status", width: 16 },
        { header: "Payment", key: "payment", width: 14 },
        { header: "Address", key: "address", width: 36 },
        { header: "Date", key: "date", width: 16 },
      ],
      rows: orders.map((o) => ({
        id: o.id.slice(-8).toUpperCase(),
        customer: o.customer.name,
        items: o.items.map((it) => `${it.quantity}x ${it.product?.name ?? it.couponBookType?.name}`).join(", "),
        total: o.totalAmount,
        status: o.status,
        payment: o.paymentStatus,
        address: o.deliveryAddress,
        date: o.createdAt.toISOString().slice(0, 10),
      })),
    },
  ]);
}
