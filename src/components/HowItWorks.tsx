"use client";

import { motion } from "framer-motion";

function DropletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c3.5 4 6 7.2 6 10.5a6 6 0 11-12 0C6 10.2 8.5 7 12 3z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-7 w-7">
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16V6h10v10M13 9h4l4 4v3h-2" />
      <circle cx="7.5" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-7 w-7">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.5 2.5 5-5.5" />
    </svg>
  );
}

const steps = [
  { Icon: DropletIcon, title: "Choose Your Bundle", text: "Pick a coupon book or order bottles directly through the site or WhatsApp." },
  { Icon: CalendarIcon, title: "Get Scheduled", text: "We assign your delivery to the nearest driver covering your area, on a routine you can rely on." },
  { Icon: TruckIcon, title: "Driver Delivers", text: "Track the status as your driver heads out, swaps your empty bottle, and marks it delivered." },
  { Icon: CheckIcon, title: "Redeem & Track", text: "Each coupon is scanned once and instantly reflected in your account balance — no guesswork." },
];

export function HowItWorks() {
  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-9 hidden h-0.5 bg-gradient-to-r from-brand-200 via-accent to-brand-200 md:block" />
      <div className="grid gap-8 md:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-brand-500 shadow-lg ring-4 ring-brand-50">
              <s.Icon />
            </div>
            <span className="mt-3 text-xs font-bold uppercase tracking-wide text-accent">Step {i + 1}</span>
            <h3 className="mt-1 font-semibold text-brand-900">{s.title}</h3>
            <p className="mt-2 text-sm text-brand-700">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
