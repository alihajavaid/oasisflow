"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({ name: z.string().min(2), description: z.string().optional() });

export async function createArea(formData: FormData) {
  await requireUser(["ADMIN"]);
  const data = schema.parse({ name: formData.get("name"), description: formData.get("description") || undefined });
  await prisma.deliveryArea.create({ data });
  revalidatePath("/admin/areas");
}
