import { DEPOT_LAT, DEPOT_LNG } from "@/lib/constants";

/**
 * Deterministic pseudo-geocoder used in place of a paid geocoding API.
 * Maps an address string to a stable point within ~8km of the depot so
 * every customer/stop gets a distinct, repeatable location for routing/maps.
 */
export function pseudoGeocode(seed: string): { lat: number; lng: number } {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < seed.length; i++) {
    h1 = (h1 * 31 + seed.charCodeAt(i)) >>> 0;
    h2 = (h2 * 17 + seed.charCodeAt(i)) >>> 0;
  }
  const offsetLat = ((h1 % 1000) / 1000 - 0.5) * 0.14; // ~ +/-7.8km
  const offsetLng = ((h2 % 1000) / 1000 - 0.5) * 0.14;
  return { lat: DEPOT_LAT + offsetLat, lng: DEPOT_LNG + offsetLng };
}
