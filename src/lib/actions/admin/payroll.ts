"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  driverId: z.string(),
  period: z.string().min(4),
  bonus: z.coerce.number().min(0).default(0),
  deductions: z.coerce.number().min(0).default(0),
});

export async function generatePayroll(formData: FormData) {
  await requireUser(["ADMIN"]);
  const parsed = schema.parse({
    driverId: formData.get("driverId"),
    period: formData.get("period"),
    bonus: formData.get("bonus") || 0,
    deductions: formData.get("deductions") || 0,
  });

  const profile = await prisma.driverProfile.findUniqueOrThrow({ where: { id: parsed.driverId } });
  const totalPaid = profile.baseSalary + parsed.bonus - parsed.deductions;

  await prisma.payrollRecord.create({
    data: {
      driverId: profile.id,
      period: parsed.period,
      baseSalary: profile.baseSalary,
      bonus: parsed.bonus,
      deductions: parsed.deductions,
      totalPaid,
    },
  });

  revalidatePath("/admin/payroll");
}

export async function markPayrollPaid(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  await prisma.payrollRecord.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } });
  revalidatePath("/admin/payroll");
}
