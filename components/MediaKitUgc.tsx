import { getImageProps } from "next/image";
import InstagramImage, { InstagramCover } from "@/components/InstagramImage";
import type { Dictionary } from "@/lib/i18n/server";
import { captionHeadline } from "@/lib/instagram-api";
import type { UgcVideo } from "@/lib/instagram";

type UgcDict = Dictionary["mediaKit"]["ugc"];

const SIZES = "(min-width: 640px) 340px, 100vw";

function UgcCard({ video, dict }: { video: UgcVideo; dict: UgcDict }) {
  const title = captionHeadline(video.caption, dict.title);
  const label = dict.videoLabel.replace("{brand}", video.brand);

  // A poster takes one URL, no srcset; without `sizes` that src is the 2x
  // candidate for a card at its widest. The cover underneath shows through if
  // the poster fails.
  const poster = getImageProps({
    src: `/api/instagram/${video.id}`,
    alt: "",
    width: 340,
    height: 604,
  }).props.src;

  return (
    <article className="flex flex-col overflow-hidden rounded-card bg-white shadow-card">
      {video.playable ? (
        <div className="relative aspect-[9/16] w-full">
          {/* The video paints to whole pixels and the box rarely is one, so
              a full-height cover would peek out as a pink hairline below. */}
          <div className="absolute inset-x-0 top-0 bottom-px">
            <InstagramCover title={title} />
          </div>
          <video
            controls
            playsInline
            preload="none"
            poster={poster}
            src={`/api/instagram/${video.id}/video`}
            aria-label={label}
            className="relative h-full w-full object-cover"
          />
        </div>
      ) : (
        <a
          href={video.permalink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
        >
          <InstagramImage
            id={video.id}
            title={title}
            sizes={SIZES}
            className="aspect-[9/16]"
          />
        </a>
      )}

      <div className="flex flex-1 flex-col gap-3 p-7">
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-pink">
          {video.brand}
        </span>
        <p className="line-clamp-2 font-display text-[17px] font-bold leading-[1.3]">
          {title}
        </p>
        <a
          href={video.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto font-bold text-pink transition-colors hover:text-pink-hover"
        >
          {dict.link}
        </a>
      </div>
    </article>
  );
}

export default function MediaKitUgc({
  videos,
  dict,
}: {
  videos: UgcVideo[];
  dict: UgcDict;
}) {
  return (
    <section className="bg-pink-soft px-[6%] py-[90px]">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-pink">
          {dict.eyebrow}
        </p>
        <h2 className="mb-4 font-display text-[clamp(28px,3.5vw,40px)] font-extrabold leading-[1.15]">
          {dict.title}
        </h2>
        <p className="mb-[50px] max-w-[640px] text-[17px] leading-[1.7] text-ink-soft">
          {dict.body}
        </p>

        <div className="grid justify-center gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,340px))]">
          {videos.map((video) => (
            <UgcCard key={video.id} video={video} dict={dict} />
          ))}
        </div>
      </div>
    </section>
  );
}
