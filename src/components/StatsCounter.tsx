"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";

type Stat = { value: number; suffix: string; label: string };

const stats: Stat[] = [
  { value: 12000, suffix: "+", label: "Happy Customers" },
  { value: 500000, suffix: "+", label: "Bottles Delivered" },
  { value: 24, suffix: "hr", label: "Delivery Turnaround" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="glass-card rounded-2xl p-6 text-center"
        >
          <div className="text-3xl font-extrabold text-white md:text-4xl">
            <Counter value={s.value} suffix={s.suffix} />
          </div>
          <p className="mt-2 text-sm text-brand-100">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
