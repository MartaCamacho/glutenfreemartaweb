import Link from "next/link";
import { setConsent } from "@/lib/consent/actions";
import type { Dictionary } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/site";

export default function CookieBanner({
  dict,
}: {
  dict: Dictionary["cookies"]["banner"];
}) {
  return (
    <section
      aria-label={dict.label}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-cream/95 px-[6%] py-5 backdrop-blur-[8px]"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[640px] text-sm leading-[1.6] text-ink-soft">
          {dict.body}{" "}
          <Link
            href={ROUTES.cookies}
            className="font-bold text-pink hover:text-pink-hover"
          >
            {dict.more}
          </Link>
        </p>

        {/* Reject must cost exactly one click, like accept. */}
        <form action={setConsent} className="flex shrink-0 gap-3">
          <button
            type="submit"
            name="consent"
            value="rejected"
            className="cursor-pointer rounded-full border-2 border-ink px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            {dict.reject}
          </button>
          <button
            type="submit"
            name="consent"
            value="accepted"
            className="cursor-pointer rounded-full border-2 border-pink bg-pink px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            {dict.accept}
          </button>
        </form>
      </div>
    </section>
  );
}
