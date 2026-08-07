import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import { INSTAGRAM_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { lab } = await getDictionary();
  return { title: lab.meta.title, description: lab.meta.description };
}

export default async function LabPage() {
  const { lab } = await getDictionary();

  return (
    <>
      <section className="bg-green-soft px-[6%] pb-[90px] pt-20">
        <div className="mx-auto grid max-w-[1400px] items-center gap-[50px] md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-green">
              {lab.hero.eyebrow}
            </p>
            <h1 className="mb-6 font-display text-[clamp(36px,5vw,56px)] font-extrabold leading-[1.05] text-pretty">
              {lab.hero.headline}
            </h1>
            <p className="mb-8 max-w-[520px] text-[19px] leading-[1.7] text-ink-soft">
              {lab.hero.body}
            </p>
            <div className="flex flex-wrap gap-4">
              {/* TODO: link the real store */}
              <Link
                href="#"
                className="rounded-full bg-ink px-7 py-4 font-bold text-white transition-opacity hover:opacity-85"
              >
                {lab.hero.appStore}
              </Link>
              {/* TODO: link the real store */}
              <Link
                href="#"
                className="rounded-full border-2 border-ink px-7 py-3.5 font-bold text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                {lab.hero.googlePlay}
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="flex aspect-[9/18] w-[260px] items-center justify-center rounded-[36px] border-8 border-ink bg-white p-4 text-center shadow-phone">
              <span className="font-display text-[20px] font-extrabold leading-[1.15] text-green">
                CeroGluten
                <br />
                Lab
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-[6%] py-[90px]">
        <p className="mb-3 text-center text-sm font-bold uppercase tracking-[0.08em] text-pink">
          {lab.features.eyebrow}
        </p>
        <h2 className="mb-[50px] text-center font-display text-[clamp(28px,3.5vw,40px)] font-extrabold leading-[1.15]">
          {lab.features.title}
        </h2>
        <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {lab.features.items.map((item) => (
            <article
              key={item.title}
              className="rounded-card bg-white p-8 shadow-card"
            >
              <p className="mb-3 font-display text-[19px] font-bold leading-[1.15]">
                {item.title}
              </p>
              <p className="text-[15px] leading-[1.6] text-ink-muted">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink px-[6%] py-[70px] text-center text-white">
        <p className="mx-auto mb-6 max-w-[700px] font-display text-[clamp(24px,3vw,34px)] font-extrabold leading-[1.15]">
          {lab.cta.title}
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-pink px-7 py-4 font-bold text-white transition-opacity hover:opacity-90"
        >
          {lab.cta.button}
        </a>
      </section>
    </>
  );
}
