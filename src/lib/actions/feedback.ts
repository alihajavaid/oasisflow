"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type FeedbackFormState = { error?: string; ok?: boolean };

const schema = z.object({
  message: z.string().min(3),
  rating: z.coerce.number().int().min(1).max(5),
});

export async function submitFeedback(_prev: FeedbackFormState, formData: FormData): Promise<FeedbackFormState> {
  const user = await requireUser(["CUSTOMER"]).catch(() => null);
  if (!user) return { error: "Please login first." };

  const parsed = schema.safeParse({ message: formData.get("message"), rating: formData.get("rating") });
  if (!parsed.success) return { error: "Please write a message and pick a rating." };

  await prisma.feedback.create({ data: { customerId: user.id, ...parsed.data } });
  revalidatePath("/account/feedback");
  return { ok: true };
}
