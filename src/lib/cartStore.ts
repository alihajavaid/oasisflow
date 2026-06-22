"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  kind: "PRODUCT" | "COUPON_BOOK";
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  removeLine: (kind: CartLine["kind"], id: string) => void;
  setQuantity: (kind: CartLine["kind"], id: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line, qty = 1) => {
        const lines = [...get().lines];
        const idx = lines.findIndex((l) => l.kind === line.kind && l.id === line.id);
        if (idx >= 0) {
          lines[idx] = { ...lines[idx], quantity: lines[idx].quantity + qty };
        } else {
          lines.push({ ...line, quantity: qty });
        }
        set({ lines });
      },
      removeLine: (kind, id) => {
        set({ lines: get().lines.filter((l) => !(l.kind === kind && l.id === id)) });
      },
      setQuantity: (kind, id, quantity) => {
        if (quantity <= 0) {
          get().removeLine(kind, id);
          return;
        }
        set({
          lines: get().lines.map((l) => (l.kind === kind && l.id === id ? { ...l, quantity } : l)),
        });
      },
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: "oasisflow-cart" }
  )
);
