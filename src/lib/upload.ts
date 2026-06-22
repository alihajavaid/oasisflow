import "server-only";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

/** Accepts an absolute http(s) URL or a local /uploads/... path produced by saveUploadedImage. */
export const imagePathSchema = z
  .string()
  .refine((v) => /^https?:\/\//.test(v) || v.startsWith("/"), "Provide a valid image URL or upload a file");

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** Saves an uploaded image file to /public/uploads and returns its public URL path, or null if no file was provided. */
export async function saveUploadedImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, WEBP, GIF, or AVIF.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5MB.");
  }

  const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
  const filename = `${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
