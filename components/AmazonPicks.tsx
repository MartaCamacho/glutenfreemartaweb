import TrackedLink from "@/components/TrackedLink";
import type { ResolvedPick } from "@/lib/amazon";
import type { Dictionary } from "@/lib/i18n/server";

export default function AmazonPicks({
  picks,
  dict,
}: {
  picks: ResolvedPick[];
  dict: Dictionary["links"]["amazon"];
}) {
  return (
    <section className="mb-12">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em] text-pink">
        {dict.eyebrow}
      </p>
      <h2 className="mb-3 font-display text-[26px] font-extrabold leading-[1.15]">
        {dict.title}
      </h2>
      <p className="mb-6 text-[16px] leading-[1.6] text-ink-soft">
        {dict.body}
      </p>

      <div className="flex flex-col gap-5">
        {picks.map((pick) => (
          <article
            key={pick.key}
            className="rounded-card bg-white p-6 shadow-card"
          >
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h3 className="font-display text-[19px] font-bold leading-[1.15]">
                {pick.title}
              </h3>
              {pick.tag ? (
                <span className="rounded-full bg-pink-soft px-3 py-1 text-sm font-bold text-pink">
                  {pick.tag}
                </span>
              ) : null}
            </div>

            {pick.description ? (
              <p className="mb-5 text-[15px] leading-[1.6] text-ink-muted">
                {pick.description}
              </p>
            ) : null}

            {/* rel="sponsored" is what Google asks for on a link that pays. */}
            <TrackedLink
              event="affiliate_click"
              params={{ network: "amazon", item: pick.title }}
              href={pick.url}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="block rounded-full bg-pink px-7 py-3.5 text-center font-bold text-white transition-opacity hover:opacity-90"
            >
              {dict.cta}
            </TrackedLink>
          </article>
        ))}
      </div>

      {/* Prescribed wording, and the agreement wants it beside the links. */}
      <p className="mt-5 text-sm leading-[1.6] text-ink-muted">
        {dict.disclosure}
      </p>
    </section>
  );
}
