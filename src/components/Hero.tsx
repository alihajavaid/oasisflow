"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/motion/TiltCard";
import { Bubbles } from "@/components/motion/Bubbles";
import { WHATSAPP_LINK } from "@/lib/constants";

export function Hero({ title, subtitle, imageUrl }: { title: string; subtitle: string; imageUrl: string }) {
  const words = title.trim().split(/\s+/);
  const highlightCount = words.length > 2 ? 2 : 1;
  const lead = words.slice(0, -highlightCount).join(" ");
  const highlight = words.slice(-highlightCount).join(" ");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
      <div className="blob h-72 w-72 bg-brand-400 -left-20 -top-20" />
      <div className="blob h-96 w-96 bg-accent right-[-6rem] top-10" style={{ animationDelay: "-4s" }} />
      <div className="blob h-64 w-64 bg-brand-200 left-1/3 bottom-[-6rem]" style={{ animationDelay: "-8s" }} />
      <Bubbles count={18} />

      <div className="container-page relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <h1 className="text-4xl font-extrabold leading-tight text-brand-900 md:text-5xl">
            {lead}{lead && " "}
            <span className="bg-gradient-to-r from-brand-500 to-accent bg-clip-text text-transparent">{highlight}</span>
          </h1>
          <p className="mt-5 max-w-md text-brand-700">{subtitle}</p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary shimmer-wrap">
              Contact on WhatsApp
            </a>
            <Link href="/products" className="btn-secondary">
              Shop Products
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="perspective-container relative mx-auto h-72 w-full max-w-sm md:h-[26rem]"
        >
          <motion.div
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 rounded-full opacity-40"
            style={{
              background: "conic-gradient(from 0deg, var(--brand-400), var(--accent), var(--brand-200), var(--brand-400))",
              filter: "blur(28px)",
            }}
          />

          <div className="float-y absolute inset-0 flex flex-col">
            <div className="relative flex-1">
              <TiltCard className="group h-full w-full" maxTilt={14} scale={1.04}>
                <Image
                  src={imageUrl}
                  alt="OasisFlow Bottles"
                  fill
                  sizes="(max-width: 768px) 90vw, 400px"
                  className="object-contain drop-shadow-2xl"
                  priority
                />
                <div
                  aria-hidden
                  className="shine-sweep pointer-events-none absolute -inset-4 z-10 h-1/3 w-1/3 rounded-full bg-white/70 opacity-40 blur-xl"
                  style={{ mixBlendMode: "soft-light" }}
                />
              </TiltCard>
            </div>

            <div aria-hidden className="relative h-16 shrink-0 md:h-20" style={{ perspective: "none" }}>
              <div
                className="relative h-full w-[70%] mx-auto opacity-50"
                style={{
                  transform: "scaleY(-1)",
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 75%)",
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 75%)",
                  filter: "blur(2px)",
                }}
              >
                <Image src={imageUrl} alt="" fill sizes="300px" className="object-contain" />
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="shadow-pulse absolute bottom-14 left-1/2 h-6 w-2/3 -translate-x-1/2 rounded-full bg-brand-900 blur-md md:bottom-[4.5rem]"
          />
        </motion.div>
      </div>

      <svg viewBox="0 0 500 60" preserveAspectRatio="none" className="block h-12 w-full text-white">
        <path d="M0,30 C150,60 350,0 500,30 L500,60 L0,60 Z" fill="currentColor" />
      </svg>
    </section>
  );
}
