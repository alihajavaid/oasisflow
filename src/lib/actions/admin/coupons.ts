"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { saveUploadedImage, imagePathSchema } from "@/lib/upload";

const schema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  totalCoupons: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  perks: z.string().optional(),
  imageUrl: imagePathSchema,
});

export async function createCouponBookType(formData: FormData) {
  await requireUser(["ADMIN"]);
  const uploadedUrl = await saveUploadedImage(formData.get("imageFile") as File | null);
  const parsed = schema.parse({
    code: formData.get("code"),
    name: formData.get("name"),
    totalCoupons: formData.get("totalCoupons"),
    price: formData.get("price"),
    perks: formData.get("perks") || undefined,
    imageUrl: uploadedUrl ?? formData.get("imageUrl"),
  });
  await prisma.couponBookType.create({
    data: { ...parsed, pricePerCoupon: Math.round((parsed.price / parsed.totalCoupons) * 100) / 100 },
  });
  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");
  revalidatePath("/");
}

export async function toggleCouponBookTypeActive(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  const type = await prisma.couponBookType.findUniqueOrThrow({ where: { id } });
  await prisma.couponBookType.update({ where: { id }, data: { active: !type.active } });
  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");
}

export async function deleteCouponBookType(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  const [orderCount, bookCount] = await Promise.all([
    prisma.orderItem.count({ where: { couponBookTypeId: id } }),
    prisma.couponBook.count({ where: { typeId: id } }),
  ]);
  if (orderCount > 0 || bookCount > 0) {
    throw new Error(
      `Can't delete: ${bookCount} customer coupon book(s) and ${orderCount} order(s) reference this type. Deactivate it instead.`,
    );
  }
  await prisma.couponBookType.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");
  revalidatePath("/");
}

export async function voidCoupon(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  await prisma.coupon.update({ where: { id }, data: { status: "VOID" } });
  revalidatePath("/admin/coupons");
}
