import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/server";
import { getInstagramPosts, type InstagramPost } from "@/lib/instagram";
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

/** Captions run long and rambling; the card only has room for the opening line. */
function headline(caption: string | null, fallback: string) {
  if (!caption) return fallback;
  const firstLine = caption.split("\n")[0].trim();
  return firstLine.length > 0 ? firstLine : fallback;
}

function LivePost({
  post,
  index,
  dict,
  locale,
}: {
  post: InstagramPost;
  index: number;
  dict: FeedDict;
  locale: Locale;
}) {
  const title = headline(post.caption, dict.imageAlt);
  const date = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  }).format(new Date(post.timestamp));

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className={`${CARD_CLASS} overflow-hidden transition-transform hover:-translate-y-1`}
    >
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={`/api/instagram/${post.id}`}
          alt={title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-7 pt-5">
        <span className={`${TAG_CLASS} ${accent(index)}`}>
          {dict.types[post.mediaType]}
        </span>
        <p className={`${TITLE_CLASS} line-clamp-2`}>{title}</p>
        <span className="text-sm text-ink-muted">{date}</span>
      </div>
    </a>
  );
}

function SamplePost({
  post,
  index,
}: {
  post: FeedDict["posts"][number];
  index: number;
}) {
  return (
    <article className={`${CARD_CLASS} gap-4 p-7`}>
      <span className={`${TAG_CLASS} ${accent(index)}`}>{post.tag}</span>
      <p className={TITLE_CLASS}>{post.title}</p>
      <span className="text-sm text-ink-muted">{post.note}</span>
    </article>
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
          {posts
            ? posts.map((post, i) => (
                <LivePost
                  key={post.id}
                  post={post}
                  index={i}
                  dict={dict}
                  locale={locale}
                />
              ))
            : dict.posts.map((post, i) => (
                <SamplePost key={post.title} post={post} index={i} />
              ))}
        </div>

        {posts ? null : (
          <p className="mt-9 text-center text-sm text-ink-muted">
            {dict.disclaimer}
          </p>
        )}
      </div>
    </section>
  );
}
