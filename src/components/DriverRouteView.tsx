"use client";

import dynamic from "next/dynamic";
import { startRoute, startStopDelivery } from "@/lib/actions/driver";
import { DeliverStopForm } from "@/components/DeliverStopForm";
import { ElapsedTimer } from "@/components/ElapsedTimer";
import type { MapStop } from "@/components/DriverMap";

const DriverMap = dynamic(() => import("@/components/DriverMap").then((m) => m.DriverMap), {
  ssr: false,
  loading: () => <div className="flex h-[420px] w-full items-center justify-center rounded-xl bg-brand-50 text-sm text-brand-700">Loading map...</div>,
});

export type DriverStopView = {
  id: string;
  sequence: number;
  status: string;
  lat: number;
  lng: number;
  customerName: string;
  address: string;
  bottlesQty: number;
  emptiesToPick: number;
  requiresCoupon: boolean;
  startedAt: string | null;
  orderTotal: number | null;
};

function mapsDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

export function DriverRouteView({
  routeId,
  routeStatus,
  depot,
  stops,
}: {
  routeId: string;
  routeStatus: string;
  depot: { lat: number; lng: number };
  stops: DriverStopView[];
}) {
  const mapStops: MapStop[] = stops.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    label: `${s.customerName} (${s.address})`,
    sequence: s.sequence,
    delivered: s.status === "DELIVERED",
  }));

  return (
    <div className="flex flex-col gap-4">
      <DriverMap depot={depot} stops={mapStops} />

      {routeStatus === "PLANNED" && (
        <form action={startRoute}>
          <input type="hidden" name="routeId" value={routeId} />
          <button type="submit" className="btn-primary">Start Route</button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {stops.map((s) => (
          <div key={s.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-brand-900">
                Stop #{s.sequence} &mdash; {s.customerName}
              </p>
              <div className="flex items-center gap-2">
                {s.startedAt && s.status !== "DELIVERED" && <ElapsedTimer startedAt={s.startedAt} />}
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{s.status}</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-brand-700">{s.address}</p>
            <p className="mt-1 text-sm text-brand-700">
              {s.bottlesQty} bottle(s) to deliver &middot; {s.emptiesToPick} empty bottle(s) to collect
            </p>

            {s.status === "SCHEDULED" && (
              <form action={startStopDelivery} className="mt-3">
                <input type="hidden" name="stopId" value={s.id} />
                <button type="submit" className="btn-primary">Start Delivery</button>
              </form>
            )}

            {s.status === "OUT_FOR_DELIVERY" && (
              <>
                <a
                  href={mapsDirectionsUrl(s.lat, s.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-3 inline-flex"
                >
                  Go to Map / Navigate
                </a>
                <DeliverStopForm
                  stopId={s.id}
                  bottlesQty={s.bottlesQty}
                  orderTotal={s.orderTotal}
                  requiresCoupon={s.requiresCoupon}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
