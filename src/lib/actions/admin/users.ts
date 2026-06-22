"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function toggleUserActive(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  revalidatePath("/admin/customers");
  revalidatePath("/admin/drivers");
}
