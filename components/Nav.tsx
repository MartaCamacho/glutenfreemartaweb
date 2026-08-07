"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { INSTAGRAM_URL, NAV_LINKS } from "@/lib/site";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-[8px] border-b border-line">
      <nav className="flex items-center justify-between px-[6%] py-5">
        <Link
          href="/"
          className="font-display text-[22px] font-extrabold text-ink"
        >
          glutenfree<span className="text-pink">marta</span>
        </Link>

        <div className="hidden items-center gap-7 text-[15px] font-semibold md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={
                pathname === link.href
                  ? "text-pink"
                  : "text-ink transition-colors hover:text-pink"
              }
            >
              {link.label}
            </Link>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-ink px-5 py-2.5 text-cream transition-opacity hover:opacity-85"
          >
            Instagram →
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full text-ink md:hidden"
        >
          <span
            className={`block h-[2px] w-5 bg-current transition-transform ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-5 bg-current transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-5 bg-current transition-transform ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-line px-[6%] pb-6 pt-2 md:hidden"
      >
        <div className="flex flex-col gap-1 text-[16px] font-semibold">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`py-3 ${
                pathname === link.href ? "text-pink" : "text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 rounded-full bg-ink px-5 py-3 text-center text-cream"
          >
            Instagram →
          </a>
        </div>
      </div>
    </header>
  );
}
