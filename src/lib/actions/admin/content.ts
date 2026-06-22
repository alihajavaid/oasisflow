"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function updateContentBlock(formData: FormData) {
  await requireUser(["ADMIN"]);
  const key = String(formData.get("key"));
  const value = String(formData.get("value"));

  await prisma.contentBlock.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidatePath("/about");
  revalidatePath("/contact");
}
