"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { AttendanceStatus } from "@prisma/client";

export async function markAttendance(formData: FormData) {
  await requireUser(["ADMIN"]);
  const date = new Date(String(formData.get("date")));
  const driverIds = formData.getAll("driverProfileId").map(String);

  for (const driverId of driverIds) {
    const status = String(formData.get(`status_${driverId}`)) as AttendanceStatus;
    await prisma.attendance.upsert({
      where: { driverId_date: { driverId, date } },
      update: { status, markedAt: new Date() },
      create: { driverId, date, status },
    });
  }

  revalidatePath("/admin/attendance");
  revalidatePath("/driver/attendance");
}
