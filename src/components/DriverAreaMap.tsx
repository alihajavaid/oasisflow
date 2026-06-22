"use client";

import dynamic from "next/dynamic";
import type { MapStop } from "@/components/DriverMap";

const DriverMap = dynamic(() => import("@/components/DriverMap").then((m) => m.DriverMap), {
  ssr: false,
  loading: () => <div className="flex h-[420px] w-full items-center justify-center rounded-xl bg-brand-50 text-sm text-brand-700">Loading map...</div>,
});

export function DriverAreaMap({ depot, stops }: { depot: { lat: number; lng: number }; stops: MapStop[] }) {
  return <DriverMap depot={depot} stops={stops} />;
}
