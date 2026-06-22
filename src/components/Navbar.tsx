"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/lib/cartStore";
import { IMG, WHATSAPP_LINK } from "@/lib/constants";

type NavUser = { name: string; role: "ADMIN" | "DRIVER" | "CUSTOMER" } | null;

export function Navbar({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/coupons", label: "Coupon Books" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : user?.role === "DRIVER" ? "/driver" : "/account";

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "border-brand-100 shadow-md shadow-brand-900/5" : "border-transparent"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Image src={`${IMG}/logo.webp`} alt="OasisFlow Logo" width={40} height={40} className="h-10 w-10" priority />
          <span className="text-lg font-bold text-brand-900">OasisFlow</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group relative text-sm font-medium text-brand-900 hover:text-brand-500"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/cart" className="relative rounded-full p-2 text-brand-700 transition-colors hover:bg-brand-50" aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.2a2 2 0 002 1.8h8.4a2 2 0 002-1.6L20 8H6" />
            </svg>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {user ? (
            <Link href={dashboardHref} className="btn-secondary">
              {user.name.split(" ")[0]}&apos;s {user.role === "ADMIN" ? "Admin" : user.role === "DRIVER" ? "Driver" : "Account"}
            </Link>
          ) : (
            <Link href="/login" className="btn-secondary">
              Login
            </Link>
          )}
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary shimmer-wrap">
            Order Now
          </a>
        </div>

        <button
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }} className="block h-0.5 w-6 bg-brand-900" />
          <motion.span animate={{ opacity: open ? 0 : 1 }} className="block h-0.5 w-6 bg-brand-900" />
          <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }} className="block h-0.5 w-6 bg-brand-900" />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-brand-100 bg-white md:hidden"
          >
            <ul className="flex flex-col gap-3 px-5 pb-5 pt-3">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block py-1 text-brand-900">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cart" onClick={() => setOpen(false)} className="block py-1 text-brand-900">
                  Cart ({cartCount})
                </Link>
              </li>
              <li>
                <Link href={user ? dashboardHref : "/login"} onClick={() => setOpen(false)} className="block py-1 text-brand-900">
                  {user ? `${user.role} Dashboard` : "Login"}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
