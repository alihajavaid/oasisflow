"use client";

import { useState } from "react";
import { useCartStore, type CartLine } from "@/lib/cartStore";

export function AddToCartButton({ line, className = "btn-primary w-full" }: { line: Omit<CartLine, "quantity">; className?: string }) {
  const addLine = useCartStore((s) => s.addLine);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addLine(line);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
