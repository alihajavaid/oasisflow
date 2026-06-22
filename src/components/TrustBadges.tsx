function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c3.5 4 6 7.2 6 10.5a6 6 0 11-12 0C6 10.2 8.5 7 12 3z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path strokeLinecap="round" d="M8 11V7a4 4 0 118 0v4" />
    </svg>
  );
}

const badges = [
  { Icon: ShieldIcon, label: "HACCP & ISO Certified" },
  { Icon: BoltIcon, label: "24-Hour Delivery" },
  { Icon: DropletIcon, label: "Free Dispenser with Coupon Books" },
  { Icon: LockIcon, label: "Tamper-Sealed Bottles" },
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-2 text-sm font-medium text-brand-800">
          <span className="text-brand-500">
            <b.Icon />
          </span>
          {b.label}
        </div>
      ))}
    </div>
  );
}
