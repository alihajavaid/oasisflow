"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  category: z.string().min(2),
  description: z.string().optional(),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
});

export async function createExpense(formData: FormData) {
  await requireUser(["ADMIN"]);
  const parsed = schema.parse({
    category: formData.get("category"),
    description: formData.get("description") || undefined,
    amount: formData.get("amount"),
    date: formData.get("date"),
  });
  await prisma.expense.create({ data: { ...parsed, date: new Date(parsed.date) } });
  revalidatePath("/admin/finance");
}
