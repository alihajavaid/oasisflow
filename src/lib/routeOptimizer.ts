export type GeoPoint = { id: string; lat: number; lng: number };

function haversineKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function routeDistance(start: GeoPoint, order: GeoPoint[]) {
  let total = 0;
  let prev = start;
  for (const point of order) {
    total += haversineKm(prev, point);
    prev = point;
  }
  return total;
}

/** Nearest-neighbor heuristic followed by 2-opt local improvement. */
export function optimizeRoute(start: GeoPoint, stops: GeoPoint[]) {
  if (stops.length === 0) return { order: [], totalDistanceKm: 0 };

  const remaining = [...stops];
  const order: GeoPoint[] = [];
  let current = start;
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const [next] = remaining.splice(bestIdx, 1);
    order.push(next);
    current = next;
  }

  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const reversed = [...order.slice(0, i), ...order.slice(i, j + 1).reverse(), ...order.slice(j + 1)];
        if (routeDistance(start, reversed) < routeDistance(start, order) - 1e-9) {
          order.splice(0, order.length, ...reversed);
          improved = true;
        }
      }
    }
  }

  return { order, totalDistanceKm: routeDistance(start, order) };
}
