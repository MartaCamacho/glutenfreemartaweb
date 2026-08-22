import type { Metadata } from "next";
import Image from "next/image";
import TrackedLink from "@/components/TrackedLink";
import {
  MediaKitAudience,
  MediaKitNumbers,
} from "@/components/MediaKitFigures";
import { getDictionary } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";
import { captionHeadline } from "@/lib/instagram-api";
import { getInstagramPostPool } from "@/lib/instagram";
import { getMediaKitStats, getPostMetrics } from "@/lib/instagram-stats";
import { selectTopPosts } from "@/lib/instagram-stats-api";
import {
  CONTACT_EMAIL,
  INSTAGRAM_STATS_WINDOW_DAYS,
  INSTAGRAM_URL,
  MEDIA_KIT_POST_COUNT,
} from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { mediaKit } = await getDictionary();

  return {
    title: mediaKit.meta.title,
    description: mediaKit.meta.description,
    // Unlisted: this goes to brands by link, not through search.
    robots: { index: false, follow: false },
  };
}

export default async function MediaKitPage() {
  const [dict, locale, stats, metrics, posts] = await Promise.all([
    getDictionary(),
    getLocale(),
    getMediaKitStats(),
    getPostMetrics(),
    getInstagramPostPool(),
  ]);

  const { mediaKit } = dict;
  const format = new Intl.NumberFormat(locale);
  const topPosts =
    posts && metrics
      ? selectTopPosts(posts, metrics, MEDIA_KIT_POST_COUNT)
      : [];

  return (
    <>
      <section className="px-[6%] pb-[70px] pt-20">
        <div className="mx-auto grid max-w-[1400px] items-center gap-[50px] md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-pink">
              {mediaKit.hero.eyebrow}
            </p>
            <h1 className="mb-6 font-display text-[clamp(36px,5vw,56px)] font-extrabold leading-[1.05] text-pretty">
              {mediaKit.hero.headline}
            </h1>
            <p className="max-w-[560px] text-[19px] leading-[1.7] text-ink-soft">
              {mediaKit.hero.body}
            </p>
          </div>

          <div className="flex justify-center">
            <Image
              src="/images/ilustracion-corazon.png"
              alt={mediaKit.hero.imageAlt}
              width={340}
              height={340}
              priority
              className="w-[260px] drop-shadow-illu md:w-[340px]"
            />
          </div>
        </div>
      </section>

      {/* No numbers without the API: a media kit with invented figures is worse
          than one with none, so these sections simply do not render. */}
      {stats ? (
        <MediaKitNumbers
          stats={stats}
          dict={mediaKit.numbers}
          locale={locale}
          windowDays={INSTAGRAM_STATS_WINDOW_DAYS}
        />
      ) : null}

      {stats?.audience ? (
        <MediaKitAudience
          audience={stats.audience}
          dict={mediaKit.audience}
          locale={locale}
        />
      ) : null}

      {topPosts.length > 0 ? (
        <section className="bg-pink-soft px-[6%] py-[90px]">
          <div className="mx-auto max-w-[1400px]">
            <h2 className="mb-11 font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15]">
              {mediaKit.topPosts.title}
            </h2>

            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {topPosts.map(({ post, metrics: post_metrics }) => {
                const title = captionHeadline(
                  post.caption,
                  mediaKit.topPosts.title,
                );

                return (
                  <TrackedLink
                    key={post.id}
                    href={post.permalink}
                    event="instagram_click"
                    params={{ link_location: "media_kit_post", post_id: post.id }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        src={`/api/instagram/${post.id}`}
                        alt={title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-4 p-7">
                      <p className="line-clamp-2 font-display text-[17px] font-bold leading-[1.3]">
                        {title}
                      </p>
                      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div>
                          <dt className="text-ink-muted">
                            {mediaKit.topPosts.reach}
                          </dt>
                          <dd className="font-display font-bold text-pink">
                            {format.format(post_metrics.reach)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-ink-muted">
                            {mediaKit.topPosts.shares}
                          </dt>
                          <dd className="font-display font-bold">
                            {format.format(post_metrics.shares)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-ink-muted">
                            {mediaKit.topPosts.saves}
                          </dt>
                          <dd className="font-display font-bold">
                            {format.format(post_metrics.saves)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </TrackedLink>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1400px] px-[6%] py-[90px]">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-pink">
          {mediaKit.formats.eyebrow}
        </p>
        <h2 className="mb-[50px] font-display text-[clamp(28px,3.5vw,40px)] font-extrabold leading-[1.15]">
          {mediaKit.formats.title}
        </h2>
        <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {mediaKit.formats.items.map((item) => (
            <article key={item.title} className="rounded-card bg-white p-8 shadow-card">
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

      <section className="mx-auto max-w-[1000px] px-[6%] pb-[90px]">
        <h2 className="mb-3 font-display text-[clamp(24px,3vw,34px)] font-extrabold leading-[1.15]">
          {mediaKit.brands.title}
        </h2>
        <p className="mb-8 text-[15px] leading-[1.7] text-ink-soft">
          {mediaKit.brands.note}
        </p>
        <ul className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {mediaKit.brands.items.map((brand) => (
            <li key={brand.name} className="rounded-card bg-green-soft p-7">
              <p className="mb-1.5 font-display text-[17px] font-bold leading-[1.15]">
                {brand.name}
              </p>
              <p className="text-[15px] leading-[1.6] text-ink-soft">
                {brand.what}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-ink px-[6%] py-[70px] text-center text-white">
        <p className="mx-auto mb-4 max-w-[700px] font-display text-[clamp(24px,3vw,34px)] font-extrabold leading-[1.15]">
          {mediaKit.cta.title}
        </p>
        <p className="mx-auto mb-8 max-w-[560px] text-[17px] leading-[1.7] text-footer-fg">
          {mediaKit.cta.body}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <TrackedLink
            href={`mailto:${CONTACT_EMAIL}`}
            event="email_click"
            params={{ link_location: "media_kit" }}
            className="rounded-full bg-pink px-7 py-4 font-bold text-white transition-opacity hover:opacity-90"
          >
            {mediaKit.cta.email}
          </TrackedLink>
          <TrackedLink
            href={INSTAGRAM_URL}
            event="instagram_click"
            params={{ link_location: "media_kit" }}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-white px-7 py-3.5 font-bold text-white transition-colors hover:bg-white hover:text-ink"
          >
            {mediaKit.cta.instagram}
          </TrackedLink>
        </div>
      </section>
    </>
  );
}
