"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email(),
  message: z.string().min(5),
});

export type ContactFormState = { ok: boolean; message: string };

export async function submitContactMessage(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Please fill in all fields correctly." };
  }

  await prisma.contactMessage.create({ data: parsed.data });

  return { ok: true, message: "Thanks for reaching out! We'll get back to you shortly." };
}
