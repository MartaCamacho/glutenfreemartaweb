import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { about } = await getDictionary();
  return { title: about.meta.title, description: about.meta.description };
}

export default async function AboutPage() {
  const { about } = await getDictionary();

  return (
    <>
      <section className="mx-auto grid max-w-[1400px] items-center gap-10 px-[6%] pb-15 pt-[70px] md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-pink">
            {about.hero.eyebrow}
          </p>
          <h1 className="mb-6 font-display text-[clamp(36px,5vw,60px)] font-extrabold leading-[1.05] text-pretty">
            {about.hero.headline}
          </h1>
          <p className="max-w-[520px] text-[18px] leading-[1.7] text-ink-soft">
            {about.hero.body}
          </p>
        </div>
        <div className="flex justify-center">
          <Image
            src="/images/ilustracion-peineta.png"
            alt={about.hero.imageAlt}
            width={1023}
            height={1537}
            priority
            className="w-[320px] max-w-full rounded-block drop-shadow-illu"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-[6%] pb-25 pt-10">
        <div className="flex flex-col">
          {about.timeline.map((item) => (
            <div
              key={item.year}
              className="grid gap-2 border-t border-line-soft py-7 sm:grid-cols-[90px_1fr] sm:gap-6"
            >
              <span className="font-display text-[20px] font-extrabold text-pink">
                {item.year}
              </span>
              <p className="text-[17px] leading-[1.6]">{item.text}</p>
            </div>
          ))}
          <div className="border-t border-line-soft" />
        </div>

        <div className="mt-15 rounded-block bg-pink-soft p-11">
          <p className="mb-4 font-display text-[24px] font-extrabold leading-[1.15]">
            {about.tone.title}
          </p>
          <p className="text-[17px] leading-[1.7] text-ink-soft">
            {about.tone.body}
          </p>
        </div>
      </section>
    </>
  );
}
