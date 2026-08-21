import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/server";
import type { MediaKitStats } from "@/lib/instagram-stats";

type MediaKit = Dictionary["mediaKit"];

const CARD_CLASS = "rounded-card bg-white p-7 shadow-card";

const FIGURE_CLASS =
  "font-display text-[clamp(30px,3.6vw,42px)] font-extrabold leading-[1.1]";

const LABEL_CLASS = "mt-2 text-sm leading-[1.4] text-ink-muted";

function Figure({
  value,
  label,
  accent = "text-ink",
}: {
  value: string;
  label: string;
  accent?: string;
}) {
  return (
    <div className={CARD_CLASS}>
      <p className={`${FIGURE_CLASS} ${accent}`}>{value}</p>
      <p className={LABEL_CLASS}>{label}</p>
    </div>
  );
}

export function MediaKitNumbers({
  stats,
  dict,
  locale,
  windowDays,
}: {
  stats: MediaKitStats;
  dict: MediaKit["numbers"];
  locale: Locale;
  windowDays: number;
}) {
  const format = new Intl.NumberFormat(locale);
  const days = String(windowDays);

  return (
    <section className="bg-green-soft px-[6%] py-[90px]">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-green">
          {dict.eyebrow}
        </p>
        <h2 className="mb-11 font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15]">
          {dict.title.replace("{days}", days)}
        </h2>

        {/* Six figures: auto-fit leaves an orphan on a wide screen and a
            six-storey column on a phone, so the rows are pinned instead. */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <Figure
            value={format.format(stats.followers)}
            label={dict.followers}
            accent="text-pink"
          />
          <Figure value={format.format(stats.totals.reach)} label={dict.reach} />
          <Figure value={format.format(stats.totals.views)} label={dict.views} />
          <Figure
            value={format.format(stats.totals.interactions)}
            label={dict.interactions}
          />
          <Figure
            value={format.format(stats.totals.shares)}
            label={dict.shares}
          />
          <Figure value={format.format(stats.totals.saves)} label={dict.saves} />
        </div>

        <p className="mt-9 max-w-[640px] text-sm leading-[1.6] text-ink-muted">
          {dict.note.replace("{days}", days)}
        </p>
      </div>
    </section>
  );
}

export function MediaKitAudience({
  audience,
  dict,
  locale,
}: {
  audience: NonNullable<MediaKitStats["audience"]>;
  dict: MediaKit["audience"];
  locale: Locale;
}) {
  // Instagram hands back ISO country codes; the browser already knows the names.
  const regions = new Intl.DisplayNames([locale], { type: "region" });

  return (
    <section className="mx-auto max-w-[1400px] px-[6%] py-[90px]">
      <h2 className="mb-11 font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15]">
        {dict.title}
      </h2>

      <div className="grid items-start gap-7 md:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          <Figure
            value={`${audience.womenShare}%`}
            label={dict.women}
            accent="text-pink"
          />
          {audience.topAge ? (
            <Figure
              value={audience.topAge.range}
              label={`${dict.topAge} · ${audience.topAge.share}%`}
              accent="text-green"
            />
          ) : null}
        </div>

        {audience.countries.length > 0 ? (
          <div className={CARD_CLASS}>
            <p className="mb-5 font-display text-[17px] font-bold leading-[1.15]">
              {dict.countries}
            </p>
            <ul className="flex flex-col gap-4">
              {audience.countries.map((country) => (
                <li key={country.code}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-4 text-[15px]">
                    <span>{regions.of(country.code) ?? country.code}</span>
                    <span className="font-bold text-ink-soft">
                      {country.share}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-line-soft">
                    <div
                      className="h-full rounded-full bg-pink"
                      style={{ width: `${country.share}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <p className="mt-9 max-w-[640px] text-[15px] leading-[1.7] text-ink-soft">
        {dict.note}
      </p>
    </section>
  );
}
