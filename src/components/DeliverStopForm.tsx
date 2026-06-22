"use client";

import { useActionState, useState } from "react";
import { deliverStop, type RedeemState } from "@/lib/actions/driver";

const initialState: RedeemState = {};

export function DeliverStopForm({
  stopId,
  bottlesQty,
  orderTotal,
  requiresCoupon,
}: {
  stopId: string;
  bottlesQty: number;
  orderTotal: number | null;
  requiresCoupon: boolean;
}) {
  const [state, action, pending] = useActionState(deliverStop, initialState);
  const [cashReceived, setCashReceived] = useState(false);

  if (state.ok) {
    return <p className="text-sm font-medium text-accent">Delivered</p>;
  }

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="stopId" value={stopId} />
      {requiresCoupon ? (
        <>
          <label className="label">
            Enter {bottlesQty} coupon code{bottlesQty > 1 ? "s" : ""} (from the physical coupon book)
          </label>
          <input className="input" name="couponCodes" placeholder="e.g. OF-AB12CD, OF-XY99ZZ" required />
        </>
      ) : (
        <>
          <input type="hidden" name="couponCodes" value="" />
          <label className="flex items-center gap-2 text-sm text-brand-900">
            <input
              type="checkbox"
              name="cashReceived"
              checked={cashReceived}
              onChange={(e) => setCashReceived(e.target.checked)}
            />
            Cash received from customer{orderTotal != null ? ` (AED ${orderTotal.toFixed(2)})` : ""}
          </label>
          {cashReceived && (
            <input
              className="input"
              name="cashAmount"
              type="number"
              step="0.01"
              defaultValue={orderTotal ?? undefined}
              placeholder="Amount collected (AED)"
            />
          )}
        </>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary self-start">
        {pending ? "Saving..." : "Mark Delivered (Done)"}
      </button>
    </form>
  );
}
