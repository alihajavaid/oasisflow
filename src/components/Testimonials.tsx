"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Review = { name: string; role: string; quote: string; rating: number };

const reviews: Review[] = [
  {
    name: "Layla Ibrahim",
    role: "Resident, Yas Island",
    rating: 5,
    quote: "Switching to the coupon book was the best decision — no more cash on hand for the driver, and I can see exactly how many bottles I have left from my account.",
  },
  {
    name: "Yusuf Al Ketbi",
    role: "Villa Owner, Saadiyat Island",
    rating: 5,
    quote: "The free dispenser that came with our coupon book still works perfectly two years later. Driver shows up almost the same time every week without us even calling.",
  },
  {
    name: "Noura Saeed",
    role: "Office Manager",
    rating: 4,
    quote: "We order for the whole office now. The water tastes noticeably cleaner than the brand we used before, and billing is simple since it's all coupons.",
  },
  {
    name: "Khalid Al Suwaidi",
    role: "Resident, Khalifa City",
    rating: 5,
    quote: "Quick WhatsApp replies, polite drivers, and they always swap the empty bottle without me having to ask twice. Exactly what you want from a water service.",
  },
  {
    name: "Mariam Yousef",
    role: "Resident, Al Reem Island",
    rating: 5,
    quote: "I topped up with the CB-75 lifetime dispenser bundle and it paid for itself within a few months compared to buying bottles one at a time.",
  },
  {
    name: "Hassan Raza",
    role: "Resident, Corniche",
    rating: 4,
    quote: "Delivery is reliable and the bottles are always sealed properly. Would love even more delivery time slots, but overall very happy.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-accent">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 5500);
    return () => clearInterval(interval);
  }, []);

  const active = reviews[index];

  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="perspective-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, rotateY: -12, x: 40 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={{ opacity: 0, rotateY: 12, x: -40 }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="rounded-2xl bg-white/10 p-8 text-center backdrop-blur-sm"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-accent text-lg font-bold text-white shadow-lg">
              {initials(active.name)}
            </div>
            <div className="mt-4 flex justify-center">
              <Stars rating={active.rating} />
            </div>
            <p className="mt-4 text-balance text-brand-50">&ldquo;{active.quote}&rdquo;</p>
            <p className="mt-5 font-semibold text-white">{active.name}</p>
            <p className="text-xs text-brand-200">{active.role}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {reviews.map((r, i) => (
          <button
            key={r.name}
            type="button"
            aria-label={`Show review from ${r.name}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-2 bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
