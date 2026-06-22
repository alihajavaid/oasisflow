"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";

const depotIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "hue-rotate-180",
});

const stopIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export type MapStop = { id: string; lat: number; lng: number; label: string; sequence: number; delivered: boolean };

export function DriverMap({ depot, stops }: { depot: { lat: number; lng: number }; stops: MapStop[] }) {
  const path: [number, number][] = [
    [depot.lat, depot.lng],
    ...stops.map((s) => [s.lat, s.lng] as [number, number]),
  ];

  return (
    <MapContainer center={[depot.lat, depot.lng]} zoom={12} scrollWheelZoom className="h-[420px] w-full rounded-xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={path} color="#0ea5d8" weight={4} opacity={0.7} />
      <Marker position={[depot.lat, depot.lng]} icon={depotIcon}>
        <Popup>OasisFlow Depot</Popup>
      </Marker>
      {stops.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={stopIcon}>
          <Popup>
            Stop #{s.sequence}: {s.label} {s.delivered ? "(Delivered)" : ""}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
