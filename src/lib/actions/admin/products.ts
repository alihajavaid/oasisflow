"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { saveUploadedImage, imagePathSchema } from "@/lib/upload";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  unit: z.string().min(1),
  imageUrl: imagePathSchema.optional(),
  stock: z.coerce.number().int().min(0),
});

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

async function uniqueProductSlug(base: string) {
  let slug = base;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

export async function createProduct(formData: FormData) {
  await requireUser(["ADMIN"]);
  const uploadedUrl = await saveUploadedImage(formData.get("imageFile") as File | null);
  const data = schema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    unit: formData.get("unit"),
    imageUrl: uploadedUrl ?? formData.get("imageUrl") ?? undefined,
    stock: formData.get("stock"),
  });
  if (!data.imageUrl) throw new Error("Upload an image or provide an image URL.");
  const slug = await uniqueProductSlug(slugify(data.name));
  await prisma.product.create({ data: { ...data, slug, imageUrl: data.imageUrl } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function updateProduct(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  const uploadedUrl = await saveUploadedImage(formData.get("imageFile") as File | null);
  const data = schema.partial().parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    unit: formData.get("unit"),
    imageUrl: uploadedUrl ?? (formData.get("imageUrl") || undefined),
    stock: formData.get("stock"),
  });
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function toggleProductActive(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.update({ where: { id }, data: { active: !product.active } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function deleteProduct(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id"));
  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    throw new Error(`Can't delete: ${orderCount} order(s) reference this product. Deactivate it instead.`);
  }
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}
