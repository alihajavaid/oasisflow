"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";
import { checkout, type CheckoutState } from "@/lib/actions/order";

const initialState: CheckoutState = {};

export default function CartPage() {
  const { lines, setQuantity, removeLine, total, clear } = useCartStore();
  const [state, formAction, pending] = useActionState(checkout, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.orderId) {
      clear();
      router.push(`/account/orders?placed=${state.orderId}`);
    }
  }, [state.orderId, clear, router]);

  if (lines.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-900">Your cart is empty</h1>
        <p className="mt-3 text-brand-700">Browse our products or coupon books to get started.</p>
        <Link href="/products" className="btn-primary mt-6 inline-flex">Shop Products</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <h1 className="mb-8 text-3xl font-bold text-brand-900">Your Cart</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {lines.map((l) => (
            <div key={`${l.kind}-${l.id}`} className="card flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 bg-white">
                <Image src={l.imageUrl} alt={l.name} fill sizes="64px" className="object-contain" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-brand-900">{l.name}</p>
                <p className="text-sm text-brand-700">AED {l.price.toFixed(2)}</p>
              </div>
              <input
                type="number"
                min={1}
                value={l.quantity}
                onChange={(e) => setQuantity(l.kind, l.id, Number(e.target.value))}
                className="input w-20 text-center"
              />
              <button
                type="button"
                onClick={() => removeLine(l.kind, l.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <form action={formAction} className="card flex flex-col gap-4 p-6">
          <input type="hidden" name="linesJson" value={JSON.stringify(lines)} />
          <div className="flex items-center justify-between border-b border-brand-100 pb-3 text-lg font-semibold text-brand-900">
            <span>Total</span>
            <span>AED {total().toFixed(2)}</span>
          </div>
          <div>
            <label className="label" htmlFor="address">Delivery Address</label>
            <input className="input" id="address" name="address" placeholder="Villa / Street / Area, Abu Dhabi" required />
          </div>
          <div>
            <label className="label" htmlFor="notes">Notes (optional)</label>
            <textarea className="input" id="notes" name="notes" rows={3} placeholder="Gate code, preferred time, etc." />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Placing order..." : "Place Order (Cash on Delivery)"}
          </button>
          <p className="text-xs text-brand-700">
            You must be logged in to place an order. Coupon books are added to your account immediately; bottle
            orders schedule a delivery request automatically.
          </p>
        </form>
      </div>
    </div>
  );
}
