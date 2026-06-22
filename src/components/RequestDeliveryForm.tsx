"use client";

import { useActionState, useState } from "react";
import { requestDelivery, type DeliveryFormState } from "@/lib/actions/delivery";

type Book = { id: string; remainingCoupons: number; typeName: string };

const initialState: DeliveryFormState = {};

export function RequestDeliveryForm({ books, defaultAddress }: { books: Book[]; defaultAddress: string }) {
  const [state, action, pending] = useActionState(requestDelivery, initialState);
  const [source, setSource] = useState<"COUPON_BOOK" | "DIRECT">(books.length > 0 ? "COUPON_BOOK" : "DIRECT");

  return (
    <form action={action} className="card flex flex-col gap-4 p-6">
      <h3 className="font-semibold text-brand-900">Request a Delivery</h3>
      <div>
        <label className="label">Payment Method</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="source" value="COUPON_BOOK" checked={source === "COUPON_BOOK"} onChange={() => setSource("COUPON_BOOK")} disabled={books.length === 0} />
            Use a coupon book
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="source" value="DIRECT" checked={source === "DIRECT"} onChange={() => setSource("DIRECT")} />
            Pay on delivery
          </label>
        </div>
      </div>
      {source === "COUPON_BOOK" && (
        <div>
          <label className="label" htmlFor="couponBookId">Coupon Book</label>
          <select className="input" id="couponBookId" name="couponBookId">
            {books.map((b) => (
              <option key={b.id} value={b.id}>{b.typeName} &mdash; {b.remainingCoupons} left</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="label" htmlFor="bottlesQty">Number of Bottles</label>
        <input className="input" id="bottlesQty" name="bottlesQty" type="number" min={1} max={20} defaultValue={1} required />
      </div>
      <div>
        <label className="label" htmlFor="address">Delivery Address</label>
        <input className="input" id="address" name="address" defaultValue={defaultAddress} required />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-accent">Delivery requested! Our team will schedule a driver soon.</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Submitting..." : "Request Delivery"}
      </button>
    </form>
  );
}
