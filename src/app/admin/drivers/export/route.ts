import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildExcelResponse } from "@/lib/excel";

export async function GET() {
  await requireUser(["ADMIN"]);

  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER" },
    include: { driverProfile: { include: { areas: true, payrolls: true } } },
    orderBy: { createdAt: "desc" },
  });

  return buildExcelResponse("oasisflow-drivers.xlsx", [
    {
      name: "Drivers",
      columns: [
        { header: "Name", key: "name", width: 24 },
        { header: "Email", key: "email", width: 28 },
        { header: "Phone", key: "phone", width: 18 },
        { header: "Areas", key: "areas", width: 30 },
        { header: "Vehicle", key: "vehicle", width: 22 },
        { header: "License No.", key: "license", width: 16 },
        { header: "Base Salary (AED)", key: "salary", width: 16 },
        { header: "Status", key: "status", width: 12 },
      ],
      rows: drivers.map((d) => ({
        name: d.name,
        email: d.email,
        phone: d.phone ?? "",
        areas: d.driverProfile?.areas.map((a) => a.name).join(", ") ?? "",
        vehicle: d.driverProfile?.vehicleInfo ?? "",
        license: d.driverProfile?.licenseNo ?? "",
        salary: d.driverProfile?.baseSalary ?? 0,
        status: d.active ? "Active" : "Suspended",
      })),
    },
  ]);
}
