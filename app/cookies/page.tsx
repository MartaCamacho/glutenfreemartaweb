import type { Metadata } from "next";
import { setConsent } from "@/lib/consent/actions";
import { getConsent } from "@/lib/consent/server";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { cookies } = await getDictionary();
  return { title: cookies.meta.title, description: cookies.meta.description };
}

export default async function CookiesPage() {
  const [{ cookies }, consent] = await Promise.all([
    getDictionary(),
    getConsent(),
  ]);
  const { page } = cookies;

  const status =
    consent === "accepted"
      ? page.choiceAccepted
      : consent === "rejected"
        ? page.choiceRejected
        : page.choicePending;

  return (
    <section className="mx-auto max-w-[800px] px-[6%] pb-25 pt-20">
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-pink">
        {page.eyebrow}
      </p>
      <h1 className="mb-5 font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.05] text-pretty">
        {page.headline}
      </h1>
      <p className="mb-12 text-[18px] leading-[1.7] text-ink-soft">
        {page.intro}
      </p>

      <h2 className="mb-3 font-display text-[22px] font-extrabold leading-[1.15]">
        {page.necessaryTitle}
      </h2>
      <p className="mb-10 text-[17px] leading-[1.7] text-ink-soft">
        {page.necessaryBody}
      </p>

      <h2 className="mb-3 font-display text-[22px] font-extrabold leading-[1.15]">
        {page.analyticsTitle}
      </h2>
      <p className="mb-10 text-[17px] leading-[1.7] text-ink-soft">
        {page.analyticsBody}
      </p>

      <div className="rounded-block bg-pink-soft p-9">
        <h2 className="mb-3 font-display text-[22px] font-extrabold leading-[1.15]">
          {page.choiceTitle}
        </h2>
        <p className="mb-2 text-[17px] leading-[1.7]">{status}</p>
        <p className="mb-5 text-[17px] leading-[1.7] text-ink-soft">
          {page.choiceChange}
        </p>
        <form action={setConsent} className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="consent"
            value="rejected"
            className="cursor-pointer rounded-full border-2 border-ink px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            {cookies.banner.reject}
          </button>
          <button
            type="submit"
            name="consent"
            value="accepted"
            className="cursor-pointer rounded-full border-2 border-pink bg-pink px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            {cookies.banner.accept}
          </button>
        </form>
      </div>

      <h2 className="mb-3 mt-10 font-display text-[22px] font-extrabold leading-[1.15]">
        {page.browserTitle}
      </h2>
      <p className="mb-10 text-[17px] leading-[1.7] text-ink-soft">
        {page.browserBody}
      </p>

      <p className="text-sm text-ink-muted">{page.updated}</p>
    </section>
  );
}
