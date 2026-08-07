"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/server";
import { INSTAGRAM_URL, ROUTES } from "@/lib/site";

export default function Nav({
  dict,
  locale,
}: {
  dict: Dictionary["nav"];
  locale: Locale;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: ROUTES.about, label: dict.about },
    { href: ROUTES.lab, label: dict.lab },
    { href: ROUTES.contact, label: dict.contact },
  ];

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
          {links.map((link) => (
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
            {dict.instagram}
          </a>
          <LocaleSwitcher current={locale} label={dict.language} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? dict.closeMenu : dict.openMenu}
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full text-ink md:hidden"
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
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
            {dict.instagram}
          </a>
          <div className="mt-4 border-t border-line pt-4">
            <LocaleSwitcher current={locale} label={dict.language} />
          </div>
        </div>
      </div>
    </header>
  );
}
