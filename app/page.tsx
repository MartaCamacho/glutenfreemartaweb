import Image from "next/image";
import Link from "next/link";
import InstagramFeed from "@/components/InstagramFeed";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { INSTAGRAM_URL, ROUTES } from "@/lib/site";

export default async function HomePage() {
  const [{ home }, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <>
      <section className="mx-auto grid max-w-[1400px] items-center gap-10 px-[6%] pb-10 pt-15 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-pink">
            {home.hero.eyebrow}
          </p>
          <h1 className="mb-6 whitespace-normal font-display text-[clamp(40px,5.5vw,72px)] font-extrabold leading-[1.02] text-pretty md:whitespace-pre-line">
            {home.hero.headline}
          </h1>
          <p className="mb-8 max-w-[520px] text-[19px] leading-[1.6] text-ink-soft">
            {home.hero.body}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-pink px-7 py-4 font-bold text-white transition-opacity hover:opacity-90"
            >
              {home.hero.ctaInstagram}
            </a>
            <Link
              href={ROUTES.lab}
              className="rounded-full border-2 border-ink px-7 py-3.5 font-bold text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              {home.hero.ctaLab}
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute h-[340px] w-[340px] rounded-full bg-pink/18 blur-[20px]" />
          <Image
            src="/images/ilustracion-corazon.png"
            alt={home.hero.imageAlt}
            width={1023}
            height={1537}
            priority
            className="relative w-[340px] max-w-full animate-floaty rounded-block drop-shadow-illu motion-reduce:animate-none"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] items-center gap-15 px-[6%] py-[90px] md:grid-cols-[0.8fr_1.2fr]">
        <Image
          src="/images/ilustracion-duda.png"
          alt={home.about.imageAlt}
          width={1023}
          height={1537}
          className="w-full max-w-[360px] rounded-block"
        />
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-green-mid">
            {home.about.eyebrow}
          </p>
          <h2 className="mb-5 font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15]">
            {home.about.title}
          </h2>
          <p className="mb-5 max-w-[560px] text-[17px] leading-[1.7] text-ink-soft">
            {home.about.body}
          </p>
          <Link
            href={ROUTES.about}
            className="font-bold text-pink transition-colors hover:text-pink-hover"
          >
            {home.about.link}
          </Link>
        </div>
      </section>

      <InstagramFeed dict={home.feed} locale={locale} />

      <section className="mx-auto grid max-w-[1400px] items-center gap-15 px-[6%] py-[90px] md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-green-mid">
            {home.lab.eyebrow}
          </p>
          <h2 className="mb-5 font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15]">
            {home.lab.title}
          </h2>
          <p className="mb-7 max-w-[560px] text-[17px] leading-[1.7] text-ink-soft">
            {home.lab.body}
          </p>
          <Link
            href={ROUTES.lab}
            className="inline-block rounded-full bg-ink px-7 py-4 font-bold text-white transition-opacity hover:opacity-85"
          >
            {home.lab.cta}
          </Link>
        </div>
        <Link
          href={ROUTES.lab}
          className="group flex items-center justify-center rounded-block bg-green-soft p-10"
        >
          <div className="w-[150px] overflow-hidden rounded-[24px] border-[6px] border-ink bg-white shadow-phone transition-transform duration-300 group-hover:-translate-y-2 motion-reduce:transition-none">
            <Image
              src="/images/cerogluten-lab-app.png"
              alt={home.lab.imageAlt}
              width={246}
              height={500}
              className="w-full"
            />
          </div>
        </Link>
      </section>
    </>
  );
}
