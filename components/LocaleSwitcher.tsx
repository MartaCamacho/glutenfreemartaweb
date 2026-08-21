"use client";

import { pushToDataLayer } from "@/lib/gtm";
import { setLocale } from "@/lib/i18n/actions";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

export default function LocaleSwitcher({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  return (
    <form
      action={setLocale}
      aria-label={label}
      className="flex items-center gap-1 text-[13px] font-bold uppercase"
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="submit"
          name="locale"
          value={locale}
          lang={locale}
          // Re-seed site_language: switching goes through a Server Action, so
          // no reload refreshes the value pushed on load.
          onClick={() =>
            pushToDataLayer({
              event: "language_change",
              new_language: locale,
              site_language: locale,
            })
          }
          aria-current={locale === current ? "true" : undefined}
          title={LOCALE_LABELS[locale]}
          className={`rounded-full px-2 py-1 transition-colors ${
            locale === current
              ? "text-pink"
              : "text-ink-muted hover:text-ink cursor-pointer"
          }`}
        >
          {locale}
        </button>
      ))}
    </form>
  );
}
