import Link from "next/link";
import Image from "next/image";
import { COMPANY_ADDRESS, COMPANY_EMAIL, COMPANY_PHONE, IMG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-brand-900 text-brand-50">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Image src={`${IMG}/logo.webp`} alt="OasisFlow Logo" width={36} height={36} className="h-9 w-9 rounded bg-white p-0.5" />
            <span className="text-lg font-bold">Oasis Flow</span>
          </div>
          <p className="text-sm text-brand-200">
            Delivering pure water to your doorstep with a commitment to quality and customer satisfaction since 2024.
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-semibold">Quick Links</h2>
          <ul className="flex flex-col gap-2 text-sm text-brand-200">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/coupons">Coupon Books</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold">Our Mission</h2>
          <p className="text-sm text-brand-200">
            To provide safe, pure, and affordable water to every home and office, ensuring health and satisfaction for all our customers.
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-semibold">Contact Information</h2>
          <ul className="flex flex-col gap-2 text-sm text-brand-200">
            <li>{COMPANY_ADDRESS}</li>
            <li>{COMPANY_PHONE}</li>
            <li>{COMPANY_EMAIL}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-brand-200">
        &copy; {new Date().getFullYear()} OasisFlow. All rights reserved.
      </div>
    </footer>
  );
}
