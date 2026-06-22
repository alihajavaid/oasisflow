"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function respondToFeedback(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  const response = String(formData.get("response"));
  await prisma.feedback.update({ where: { id }, data: { response } });
  revalidatePath("/admin/feedback");
  revalidatePath("/account/feedback");
}

export async function markContactHandled(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  await prisma.contactMessage.update({ where: { id }, data: { handled: true } });
  revalidatePath("/admin/feedback");
}
