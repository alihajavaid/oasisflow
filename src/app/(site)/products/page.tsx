import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/AddToCartButton";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";
import { TiltCard } from "@/components/motion/TiltCard";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });

  return (
    <div className="container-page py-14">
      <FadeIn>
        <h1 className="text-center text-3xl font-bold text-brand-900">Our Products</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-brand-700">
          Pure and refreshing water delivered in convenient bottles, plus dispensers for home or office.
        </p>
      </FadeIn>

      <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <StaggerItem key={p.id}>
            <TiltCard className="group card overflow-hidden">
              <div className="relative h-52 w-full overflow-hidden bg-white">
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-brand-900">{p.name}</h2>
                <p className="mt-1 font-bold text-brand-500">AED {p.price.toFixed(2)}</p>
                <p className="mt-2 text-sm text-brand-700">{p.description}</p>
                <p className="mt-2 text-xs text-brand-700">
                  {p.stock > 0 ? `${p.stock} in stock` : "Currently out of stock"}
                </p>
                <AddToCartButton
                  line={{ kind: "PRODUCT", id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl }}
                  className="btn-primary mt-4 w-full"
                />
              </div>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
