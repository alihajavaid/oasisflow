import { prisma } from "@/lib/prisma";
import { BulkWhatsAppComposer } from "@/components/BulkWhatsAppComposer";
import { BASE_PATH } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER", active: true },
    include: { deliveryRequests: { include: { area: true }, orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Bulk WhatsApp Messages</h1>
        <a href={`${BASE_PATH}/admin/customers/export`} className="btn-secondary">Export Customer List</a>
      </div>
      <p className="mb-6 text-sm text-brand-700">
        Built from your customer database ({customers.length} active customers). Select recipients, write a
        message, then send each WhatsApp chat individually &mdash; this uses the free wa.me link method, not the
        paid WhatsApp Business API, so each message still needs a manual click to send.
      </p>

      <BulkWhatsAppComposer
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          area: c.deliveryRequests[0]?.area?.name ?? null,
        }))}
      />
    </div>
  );
}
