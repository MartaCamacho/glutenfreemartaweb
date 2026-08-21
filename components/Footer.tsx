import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import type { Dictionary } from "@/lib/i18n/server";
import { INSTAGRAM_URL, ROUTES } from "@/lib/site";

export default function Footer({
  dict,
  navDict,
}: {
  dict: Dictionary["footer"];
  navDict: Dictionary["nav"];
}) {
  const links = [
    { href: ROUTES.about, label: navDict.about },
    { href: ROUTES.lab, label: navDict.lab },
    { href: ROUTES.contact, label: navDict.contact },
  ];

  return (
    <footer className="border-t border-white/10 bg-ink px-[6%] pb-10 pt-15 text-footer-fg">
      <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-10">
        <div>
          <p className="mb-3 font-display text-[22px] font-extrabold text-white">
            glutenfreemarta
          </p>
          <p className="max-w-[320px] text-sm leading-relaxed text-footer-dim">
            {dict.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-15">
          <div className="flex flex-col gap-2.5 text-[15px]">
            <span className="mb-1 font-bold text-white">{dict.explore}</span>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-footer-link transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ROUTES.cookies}
              className="text-footer-link transition-colors hover:text-white"
            >
              {dict.cookies}
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 text-[15px]">
            <span className="mb-1 font-bold text-white">{dict.follow}</span>
            <TrackedLink
              href={INSTAGRAM_URL}
              event="instagram_click"
              params={{ link_location: "footer" }}
              target="_blank"
              rel="noopener noreferrer"
              className="text-footer-link transition-colors hover:text-white"
            >
              {dict.instagram}
            </TrackedLink>
          </div>
        </div>
      </div>

      <p className="mt-[50px] text-center text-[13px] text-footer-copy">
        {dict.copyright}
      </p>
    </footer>
  );
}
