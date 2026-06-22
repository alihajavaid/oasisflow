import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/AddToCartButton";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";
import { TiltCard } from "@/components/motion/TiltCard";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const types = await prisma.couponBookType.findMany({ where: { active: true }, orderBy: { totalCoupons: "asc" } });

  return (
    <div className="container-page py-14">
      <FadeIn>
        <h1 className="text-center text-3xl font-bold text-brand-900">Coupon Books</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-brand-700">
          Save more with our coupon books! Buy online, then redeem one coupon per bottle whenever our driver
          delivers to you &mdash; track your remaining balance any time from your account.
        </p>
      </FadeIn>

      <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((c) => (
          <StaggerItem key={c.id}>
            <TiltCard className="group card overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden bg-white">
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-contain p-5 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-brand-900">{c.name}</h2>
                <p className="mt-1 font-bold text-brand-500">AED {c.price.toFixed(2)}</p>
                <p className="mt-2 text-sm text-brand-700">
                  Get {c.totalCoupons} coupons. Each coupon is worth AED {c.pricePerCoupon.toFixed(2)}.
                </p>
                {c.perks && <p className="mt-1 text-sm text-brand-700">{c.perks}</p>}
                <AddToCartButton
                  line={{ kind: "COUPON_BOOK", id: c.id, name: c.name, price: c.price, imageUrl: c.imageUrl }}
                  className="btn-primary mt-4 w-full"
                />
              </div>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <FadeIn delay={0.1} className="card mx-auto mt-12 max-w-2xl p-6 text-sm text-brand-700">
        <h3 className="mb-2 font-semibold text-brand-900">How redemption works</h3>
        <p>
          When our driver delivers a bottle, they will scan/enter the unique coupon code printed in your coupon
          book. Each coupon code can only be redeemed once &mdash; our system blocks any attempt to reuse a code,
          so your balance is always accurate.
        </p>
      </FadeIn>
    </div>
  );
}
