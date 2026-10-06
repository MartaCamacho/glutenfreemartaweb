import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/server";
import { captionHeadline } from "@/lib/instagram-api";
import { getInstagramPosts, type InstagramMediaType } from "@/lib/instagram";
import { FALLBACK_POSTS } from "@/lib/instagram-fallback";
import { INSTAGRAM_URL } from "@/lib/site";

const POST_ACCENTS = [
  "text-green-mid",
  "text-pink",
  "text-green-mid",
  "text-pink",
];

const CARD_CLASS =
  "flex min-h-[220px] flex-col justify-between rounded-card bg-white shadow-card";

const TAG_CLASS = "text-xs font-bold uppercase tracking-[0.06em]";

const TITLE_CLASS = "font-display text-[19px] font-bold leading-[1.3]";

type FeedDict = Dictionary["home"]["feed"];

function accent(index: number) {
  return POST_ACCENTS[index % POST_ACCENTS.length];
}

/**
 * One card for both states. The frozen fallback posts are real, so they link
 * out like the live ones; the only thing they lack is an image, because the
 * proxy that serves those needs the token that is missing in the first place.
 */
function PostCard({
  permalink,
  caption,
  mediaType,
  timestamp,
  imageId,
  index,
  dict,
  locale,
}: {
  permalink: string;
  caption: string | null;
  mediaType: InstagramMediaType;
  timestamp: string;
  imageId?: string;
  index: number;
  dict: FeedDict;
  locale: Locale;
}) {
  const title = captionHeadline(caption, dict.imageAlt);
  const date = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  }).format(new Date(timestamp));

  return (
    <a
      href={permalink}
      target="_blank"
      rel="noopener noreferrer"
      className={`${CARD_CLASS} overflow-hidden transition-transform hover:-translate-y-1`}
    >
      {imageId ? (
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={`/api/instagram/${imageId}`}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div
        className={`flex flex-1 flex-col justify-between gap-3 p-7 ${imageId ? "pt-5" : ""}`}
      >
        <span className={`${TAG_CLASS} ${accent(index)}`}>
          {dict.types[mediaType]}
        </span>
        <p className={`${TITLE_CLASS} line-clamp-2`}>{title}</p>
        <span className="text-sm text-ink-muted">{date}</span>
      </div>
    </a>
  );
}

export default async function InstagramFeed({
  dict,
  locale,
}: {
  dict: FeedDict;
  locale: Locale;
}) {
  const posts = await getInstagramPosts();
  const cards = posts
    ? posts.map((post) => ({ ...post, imageId: post.id, key: post.id }))
    : FALLBACK_POSTS.map((post) => ({
        ...post,
        imageId: undefined,
        key: post.permalink,
      }));

  return (
    <section className="bg-pink-soft px-[6%] py-[90px]">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-pink">
          {dict.eyebrow}
        </p>
        <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
          <h2 className="max-w-[560px] font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15]">
            {dict.title}
          </h2>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap font-bold text-pink transition-colors hover:text-pink-hover"
          >
            {dict.link}
          </a>
        </div>

        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {cards.map((card, i) => (
            <PostCard
              key={card.key}
              permalink={card.permalink}
              caption={card.caption}
              mediaType={card.mediaType}
              timestamp={card.timestamp}
              imageId={card.imageId}
              index={i}
              dict={dict}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
