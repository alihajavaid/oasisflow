import { prisma } from "@/lib/prisma";

export async function getContentMap(): Promise<Record<string, string>> {
  const blocks = await prisma.contentBlock.findMany();
  return Object.fromEntries(blocks.map((b) => [b.key, b.value]));
}
