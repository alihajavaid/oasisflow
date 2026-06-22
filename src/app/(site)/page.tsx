import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getContentMap } from "@/lib/content";
import { IMG } from "@/lib/constants";
import { Hero } from "@/components/Hero";
import { Testimonials } from "@/components/Testimonials";
import { TrustBadges } from "@/components/TrustBadges";
import { StatsCounter } from "@/components/StatsCounter";
import { HowItWorks } from "@/components/HowItWorks";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";
import { TiltCard } from "@/components/motion/TiltCard";
import { Bubbles } from "@/components/motion/Bubbles";

export const dynamic = "force-dynamic";

const qualities = [
  { icon: "pure-water.webp", title: "Pure & Safe Water", text: "OasisFlow Water is processed in an environment where hygiene and safety is strictly monitored." },
  { icon: "certified.webp", title: "Certified", text: "OasisFlow is a HACCP & ISO certified company." },
  { icon: "premium-quality.webp", title: "Premium Quality Assurance", text: "We maintain high quality standards from bottling to delivery, guaranteeing every drop is pure and fresh." },
  { icon: "fast-delivery.webp", title: "Fast & Reliable Delivery", text: "Get your water delivered within 24 hours. We prioritize speed without compromising on service quality." },
  { icon: "flexibal-scheduling.webp", title: "Flexible Scheduling", text: "Choose delivery times that suit your routine. We adapt to your schedule for maximum convenience." },
  { icon: "customer-satisfaction.webp", title: "Customer Satisfaction", text: "Your satisfaction is our top priority. We offer you the best quality for the best price." },
  { icon: "coupons.webp", title: "Affordable Pricing", text: "Our coupon books provide excellent value, with bigger savings on larger packages." },
];

const services = [
  { image: "coupons.webp", title: "Coupon System", text: "Enjoy flexible savings and easy redemption with our digital and physical coupon books. Perfect for families and offices looking to save more on every order." },
  { image: "fast-delivery.webp", title: "Delivery Model", text: "Experience fast, reliable, and scheduled water delivery right to your doorstep. Our delivery model adapts to your needs for maximum convenience." },
  { image: "dispenser.webp", title: "Dispenser Options", text: "Choose from a range of modern water dispensers for home or office. We offer rental and purchase options to suit your hydration needs." },
];

export default async function HomePage() {
  const [content, products, couponTypes] = await Promise.all([
    getContentMap(),
    prisma.product.findMany({ where: { active: true }, take: 3 }),
    prisma.couponBookType.findMany({ where: { active: true }, take: 4 }),
  ]);

  return (
    <div>
      <Hero
        title={content.hero_title ?? "Pure Water Delivered To Your Doorstep"}
        subtitle={
          content.hero_subtitle ??
          "Experience the convenience of premium water delivery service with OasisFlow. Stay hydrated with our pure, refreshing water."
        }
        imageUrl={content.hero_image ?? `${IMG}/hero-bottles.webp`}
      />

      <section className="border-y border-brand-100 bg-white py-6">
        <div className="container-page">
          <TrustBadges />
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900 py-14">
        <Bubbles count={10} />
        <div className="container-page relative">
          <StatsCounter />
        </div>
      </section>

      <section className="container-page py-16">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-bold text-brand-900">Why Choose OasisFlow?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-700">
            {content.why_choose_intro ??
              "We provide premium water delivery services that prioritize purity, convenience and customer satisfaction. Pure and Fresh Till the Last Drop!"}
          </p>
        </FadeIn>
        <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {qualities.map((q) => (
            <StaggerItem key={q.title}>
              <TiltCard className="card flex gap-4 p-5" maxTilt={6} scale={1.02}>
                <Image src={`${IMG}/${q.icon}`} alt={q.title} width={40} height={40} className="h-10 w-10 shrink-0" />
                <div>
                  <h3 className="font-semibold text-brand-900">{q.title}</h3>
                  <p className="mt-1 text-sm text-brand-700">{q.text}</p>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="container-page py-16">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-bold text-brand-900">How It Works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-700">
            From your first order to your hundredth refill, here&apos;s the simple loop that keeps your home or
            office hydrated.
          </p>
        </FadeIn>
        <div className="mt-12">
          <HowItWorks />
        </div>
      </section>

      <section className="bg-brand-50 py-16">
        <div className="container-page">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold text-brand-900">Our Products</h2>
          </FadeIn>
          <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <StaggerItem key={p.id}>
                <TiltCard className="group card overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden bg-white">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 350px"
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-brand-900">{p.name}</h3>
                    <p className="mt-1 text-brand-500 font-bold">AED {p.price.toFixed(2)}</p>
                    <p className="mt-2 text-sm text-brand-700">{p.description}</p>
                    <Link href="/products" className="btn-primary mt-4 w-full">
                      View &amp; Order
                    </Link>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="container-page py-16">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-bold text-brand-900">Coupon Books</h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-700">
            Save more with our coupon books! Enjoy bigger savings on larger packages.
          </p>
        </FadeIn>
        <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {couponTypes.map((c) => (
            <StaggerItem key={c.id}>
              <TiltCard className="card overflow-hidden text-center">
                <div className="relative h-40 w-full overflow-hidden bg-white">
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 250px"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-brand-900">{c.name}</h3>
                  <p className="mt-1 text-sm text-brand-700">
                    {c.totalCoupons} coupons for AED {c.price}
                  </p>
                  <Link href="/coupons" className="btn-secondary mt-3 w-full">
                    View Details
                  </Link>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="bg-brand-50 py-16">
        <div className="container-page">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold text-brand-900">Our Services</h2>
          </FadeIn>
          <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((s) => (
              <StaggerItem key={s.title}>
                <TiltCard className="card p-6 text-center" maxTilt={8}>
                  <Image src={`${IMG}/${s.image}`} alt={s.title} width={56} height={56} className="mx-auto h-14 w-14" />
                  <h3 className="mt-4 font-semibold text-brand-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-brand-700">{s.text}</p>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <FadeIn className="relative mx-auto h-64 w-full max-w-sm">
            <div className="perspective-container float-y h-full w-full">
              <Image src={`${IMG}/aboutoasis.webp`} alt="About OasisFlow" fill sizes="(max-width: 768px) 90vw, 380px" className="object-contain" />
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h2 className="text-3xl font-bold text-brand-900">About Us</h2>
            <p className="mt-4 text-brand-700">
              {content.about_text ??
                "OasisFlow is a modern bottled water delivery platform designed to bring pure, premium 5-gallon water bottles right to your doorstep."}
            </p>
            <Link href="/about" className="btn-primary mt-6">
              Read More
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-900 py-16 text-white">
        <div className="blob h-72 w-72 bg-brand-500 -left-10 top-10" />
        <div className="blob h-72 w-72 bg-accent right-[-4rem] bottom-0" style={{ animationDelay: "-6s" }} />
        <Bubbles count={12} />
        <div className="container-page relative">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold">What Our Customers Say</h2>
          </FadeIn>
          <div className="mt-10">
            <Testimonials />
          </div>
        </div>
      </section>
    </div>
  );
}
