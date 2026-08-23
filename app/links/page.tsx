import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DiscountCard from "@/components/DiscountCard";
import { getDictionary } from "@/lib/i18n/server";
import { DISCOUNTS, EXTRA_LINKS, hasAffiliateLinks } from "@/lib/links";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { links } = await getDictionary();
  return { title: links.meta.title, description: links.meta.description };
}

const ROW_CLASS =
  "block rounded-card bg-white p-6 shadow-card transition-transform hover:-translate-y-1";

export default async function LinksPage() {
  const { links } = await getDictionary();

  return (
    // Narrow at every width: nearly every visit is a thumb tap arriving from
    // the Instagram bio, so this never becomes a two-column layout.
    <div className="mx-auto max-w-[640px] px-[6%] pb-25 pt-15">
      <header className="mb-12 text-center">
        <Image
          src="/images/ilustracion-corazon.png"
          alt={links.hero.imageAlt}
          width={1023}
          height={1537}
          priority
          className="mx-auto mb-5 w-[130px] drop-shadow-illu"
        />
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-pink">
          {links.hero.eyebrow}
        </p>
        <h1 className="mb-4 whitespace-normal font-display text-[clamp(30px,7vw,42px)] font-extrabold leading-[1.1] text-pretty md:whitespace-pre-line">
          {links.hero.headline}
        </h1>
        <p className="text-[17px] leading-[1.7] text-ink-soft">
          {links.hero.body}
        </p>
      </header>

      <section className="mb-12 rounded-block bg-green-soft p-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em] text-green">
          {links.lab.eyebrow}
        </p>
        <h2 className="mb-3 font-display text-[26px] font-extrabold leading-[1.15]">
          {links.lab.title}
        </h2>
        <p className="mb-6 text-[16px] leading-[1.6] text-ink-soft">
          {links.lab.body}
        </p>
        {/* No target="_blank": apps.apple.com redirects to itms-appss://, and
            Instagram's in-app browser — where this page mostly lives — drops
            that scheme switch when it lands in a secondary window. */}
        <div className="flex flex-wrap gap-3">
          <a
            href={APP_STORE_URL}
            className="flex-1 rounded-full bg-ink px-4 py-3.5 sm:px-6 text-center font-bold text-white transition-opacity hover:opacity-85"
          >
            {links.lab.appStore}
          </a>
          <a
            href={GOOGLE_PLAY_URL}
            className="flex-1 rounded-full border-2 border-ink px-4 py-3 sm:px-6 text-center font-bold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            {links.lab.googlePlay}
          </a>
        </div>
      </section>

      {DISCOUNTS.length > 0 ? (
        <section className="mb-12">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em] text-pink">
            {links.discounts.eyebrow}
          </p>
          <h2 className="mb-6 font-display text-[26px] font-extrabold leading-[1.15]">
            {links.discounts.title}
          </h2>
          <div className="flex flex-col gap-5">
            {DISCOUNTS.map((discount) => (
              <DiscountCard
                key={discount.id}
                discount={discount}
                dict={links.discounts}
              />
            ))}
          </div>
        </section>
      ) : null}

      {EXTRA_LINKS.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-6 font-display text-[26px] font-extrabold leading-[1.15]">
            {links.more.title}
          </h2>
          <div className="flex flex-col gap-4">
            {EXTRA_LINKS.map((link) => {
              const item = links.more.items[link.id];
              const body = (
                <>
                  <p className="mb-1 font-display text-[17px] font-bold leading-[1.3]">
                    {item.title}
                  </p>
                  <p className="text-[15px] leading-[1.6] text-ink-muted">
                    {item.body}
                  </p>
                </>
              );

              return link.href.startsWith("/") ? (
                <Link key={link.id} href={link.href} className={ROW_CLASS}>
                  {body}
                </Link>
              ) : (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ROW_CLASS}
                >
                  {body}
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* A claim about money, so only made when one of the links earns it. */}
      {hasAffiliateLinks() ? (
        <p className="text-center text-sm leading-[1.6] text-ink-muted">
          {links.disclosure}
        </p>
      ) : null}
    </div>
  );
}
