"use client";

import { useEffect, useState } from "react";

type Bubble = { left: number; size: number; duration: number; delay: number; opacity: number };

export function Bubbles({ count = 14, className }: { count?: number; className?: string }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setBubbles(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 6 + Math.random() * 18,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 8,
        opacity: 0.15 + Math.random() * 0.3,
      })),
    );
  }, [count]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-white"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            animation: `bubble-rise ${b.duration}s ease-in infinite`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
