export function generateCouponCode() {
  return "OF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
