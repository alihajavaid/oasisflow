"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, hashPassword } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(6),
  vehicleInfo: z.string().optional(),
  licenseNo: z.string().optional(),
  baseSalary: z.coerce.number().min(0),
});

export async function createDriver(formData: FormData) {
  await requireUser(["ADMIN"]);
  const parsed = schema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    vehicleInfo: formData.get("vehicleInfo") || undefined,
    licenseNo: formData.get("licenseNo") || undefined,
    baseSalary: formData.get("baseSalary"),
  });
  const areaIds = formData.getAll("areaIds").map(String);

  const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (existing) throw new Error("A user with this email already exists.");

  const passwordHash = await hashPassword(parsed.password);
  const user = await prisma.user.create({
    data: { name: parsed.name, email: parsed.email, phone: parsed.phone, passwordHash, role: "DRIVER" },
  });
  await prisma.driverProfile.create({
    data: {
      userId: user.id,
      vehicleInfo: parsed.vehicleInfo,
      licenseNo: parsed.licenseNo,
      baseSalary: parsed.baseSalary,
      areas: { connect: areaIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/admin/drivers");
}

export async function updateDriverAreas(formData: FormData) {
  await requireUser(["ADMIN"]);
  const driverProfileId = String(formData.get("driverProfileId"));
  const areaIds = formData.getAll("areaIds").map(String);
  await prisma.driverProfile.update({
    where: { id: driverProfileId },
    data: { areas: { set: areaIds.map((id) => ({ id })) } },
  });
  revalidatePath("/admin/drivers");
  revalidatePath("/admin/routes");
}
