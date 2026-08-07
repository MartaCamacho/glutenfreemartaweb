import Link from "next/link";
import { INSTAGRAM_URL, NAV_LINKS } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-ink px-[6%] pb-10 pt-15 text-footer-fg">
      <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-10">
        <div>
          <p className="mb-3 font-display text-[22px] font-extrabold text-white">
            glutenfreemarta
          </p>
          <p className="max-w-[320px] text-sm leading-relaxed text-footer-dim">
            Celíaca desde 2018. Madre. Programadora. La vida sin gluten contada
            tal cual es.
          </p>
        </div>

        <div className="flex flex-wrap gap-15">
          <div className="flex flex-col gap-2.5 text-[15px]">
            <span className="mb-1 font-bold text-white">Explora</span>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-footer-link transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 text-[15px]">
            <span className="mb-1 font-bold text-white">Sígueme</span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-footer-link transition-colors hover:text-white"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      <p className="mt-[50px] text-center text-[13px] text-footer-copy">
        © 2026 Glutenfreemarta
      </p>
    </footer>
  );
}
