import Image from "next/image";
import { getContentMap } from "@/lib/content";
import { IMG } from "@/lib/constants";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";
import { TiltCard } from "@/components/motion/TiltCard";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const content = await getContentMap();

  return (
    <div className="container-page py-14">
      <FadeIn>
        <h1 className="text-center text-3xl font-bold text-brand-900">About Us</h1>
      </FadeIn>
      <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
        <FadeIn className="relative mx-auto h-72 w-full max-w-md">
          <div className="perspective-container float-y h-full w-full">
            <Image src={`${IMG}/aboutoasis.webp`} alt="OasisFlow" fill sizes="(max-width: 768px) 90vw, 400px" className="object-contain" />
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <h2 className="text-2xl font-bold text-brand-900">Oasis Flow</h2>
          <p className="mt-4 text-brand-700">
            {content.about_text ??
              "OasisFlow is a modern bottled water delivery platform designed to bring pure, premium 5-gallon water bottles right to your doorstep, quickly, easily, and affordably."}
          </p>
          <p className="mt-4 text-brand-700">
            For the last 20 years, the company has helped thousands of families drink real mineral water and
            continues its successful journey with our satisfied customers. Today, OasisFlow is striving to help
            families around the globe with our proficient team and world-class facilities.
          </p>
        </FadeIn>
      </div>

      <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
        <StaggerItem>
          <TiltCard className="card p-6 text-center" maxTilt={8}>
            <Image src={`${IMG}/why-choose-img1.webp`} alt="" width={64} height={64} className="mx-auto h-16 w-16 object-contain" />
            <h3 className="mt-3 font-semibold text-brand-900">Our Mission</h3>
            <p className="mt-2 text-sm text-brand-700">
              To provide safe, pure, and affordable water to every home and office, ensuring health and
              satisfaction for all our customers.
            </p>
          </TiltCard>
        </StaggerItem>
        <StaggerItem>
          <TiltCard className="card p-6 text-center" maxTilt={8}>
            <Image src={`${IMG}/certified.webp`} alt="" width={64} height={64} className="mx-auto h-16 w-16 object-contain" />
            <h3 className="mt-3 font-semibold text-brand-900">HACCP &amp; ISO Certified</h3>
            <p className="mt-2 text-sm text-brand-700">
              Strict hygiene and safety monitoring at every stage of bottling, storage, and delivery.
            </p>
          </TiltCard>
        </StaggerItem>
        <StaggerItem>
          <TiltCard className="card p-6 text-center" maxTilt={8}>
            <Image src={`${IMG}/why-choose-img2.webp`} alt="" width={64} height={64} className="mx-auto h-16 w-16 object-contain" />
            <h3 className="mt-3 font-semibold text-brand-900">Sustainability</h3>
            <p className="mt-2 text-sm text-brand-700">
              We are committed to sustainability and excellence in service across the UAE.
            </p>
          </TiltCard>
        </StaggerItem>
      </StaggerGroup>
    </div>
  );
}
