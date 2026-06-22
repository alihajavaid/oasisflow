"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, hashPassword } from "@/lib/auth";
import { parseExcelFile } from "@/lib/excel";
import { generateCouponCode } from "@/lib/coupon";

export type ImportRowResult = {
  row: number;
  name: string;
  email: string;
  status: "created" | "updated" | "error";
  tempPassword?: string;
  couponBook?: string;
  message?: string;
};

export type ImportState = {
  results?: ImportRowResult[];
  error?: string;
};

const rowSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  couponBookCode: z.string().optional(),
  totalCoupons: z.coerce.number().int().positive().optional(),
  remainingCoupons: z.coerce.number().int().min(0).optional(),
});

function generateTempPassword() {
  return "OF-" + crypto.randomUUID().slice(0, 8);
}

export async function importCustomers(_prev: ImportState, formData: FormData): Promise<ImportState> {
  await requireUser(["ADMIN"]);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose an Excel file to upload." };

  let rawRows: Record<string, string>[];
  try {
    rawRows = await parseExcelFile(file);
  } catch {
    return { error: "Could not read that file. Use the downloadable template format (.xlsx)." };
  }
  if (rawRows.length === 0) return { error: "No data rows found in the file." };

  const results: ImportRowResult[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 2; // header is row 1
    const raw = rawRows[i];
    const parsed = rowSchema.safeParse({
      name: raw.Name,
      email: raw.Email,
      phone: raw.Phone || undefined,
      address: raw.Address || undefined,
      couponBookCode: raw.CouponBookCode || undefined,
      totalCoupons: raw.TotalCoupons || undefined,
      remainingCoupons: raw.RemainingCoupons || undefined,
    });

    if (!parsed.success) {
      results.push({
        row: rowNumber,
        name: raw.Name ?? "",
        email: raw.Email ?? "",
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid row",
      });
      continue;
    }

    const { name, email, phone, address, couponBookCode, totalCoupons, remainingCoupons } = parsed.data;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      let tempPassword: string | undefined;
      let userId: string;

      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            phone: phone ?? existing.phone,
            address: address ?? existing.address,
          },
        });
        userId = existing.id;
      } else {
        tempPassword = generateTempPassword();
        const passwordHash = await hashPassword(tempPassword);
        const user = await prisma.user.create({
          data: { name, email, phone, address, passwordHash, role: "CUSTOMER" },
        });
        userId = user.id;
      }

      let couponBookLabel: string | undefined;

      if (couponBookCode) {
        const type = await prisma.couponBookType.findUnique({ where: { code: couponBookCode } });
        if (!type) {
          results.push({
            row: rowNumber,
            name,
            email,
            status: "error",
            message: `Coupon book code "${couponBookCode}" does not exist. Create it under Coupon Books first.`,
          });
          continue;
        }

        const total = totalCoupons ?? type.totalCoupons;
        const remaining = remainingCoupons ?? total;
        const used = Math.max(0, total - remaining);

        const book = await prisma.couponBook.create({
          data: { customerId: userId, typeId: type.id, totalCoupons: total, remainingCoupons: remaining },
        });

        const coupons = Array.from({ length: total }, (_, idx) => ({
          code: generateCouponCode(),
          couponBookId: book.id,
          status: idx < used ? ("USED" as const) : ("UNUSED" as const),
          usedAt: idx < used ? new Date() : null,
        }));
        await prisma.coupon.createMany({ data: coupons });

        couponBookLabel = `${type.name} (${remaining}/${total} remaining)`;
      }

      results.push({
        row: rowNumber,
        name,
        email,
        status: existing ? "updated" : "created",
        tempPassword,
        couponBook: couponBookLabel,
      });
    } catch (e) {
      results.push({
        row: rowNumber,
        name,
        email,
        status: "error",
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  revalidatePath("/admin/customers");
  revalidatePath("/admin/coupons");
  return { results };
}
