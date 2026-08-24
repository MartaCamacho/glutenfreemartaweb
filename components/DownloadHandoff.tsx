"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/server";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/site";

/** How long to wait before deciding the store never took over. */
const HANDOFF_MS = 1200;

export default function DownloadHandoff({
  dict,
  stores,
}: {
  dict: Dictionary["download"];
  stores: { appStore: string; googlePlay: string };
}) {
  const [blocked, setBlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const store = /Android/i.test(ua)
      ? GOOGLE_PLAY_URL
      : /iPhone|iPad|iPod/i.test(ua)
        ? APP_STORE_URL
        : null;

    // On a desktop there is nothing to hand off to: the two links below are
    // already the answer.
    if (!store) return;

    // No callback exists for this, so failure is inferred from still being
    // here afterwards. Instagram's browser cannot follow Apple's
    // itms-appss:// redirect and drops the navigation without a word.
    const timer = setTimeout(() => setBlocked(true), HANDOFF_MS);
    window.location.href = store;
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (blocked) {
    return (
      <>
        <h1 className="mb-5 font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.05] text-pretty">
          {dict.blocked.title}
        </h1>
        <p className="mb-6 text-[18px] leading-[1.7] text-ink-soft">
          {dict.blocked.body}
        </p>

        <div className="rounded-block bg-pink-soft p-9">
          <p className="mb-6 text-[17px] leading-[1.7]">{dict.blocked.steps}</p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard
                .writeText(APP_STORE_URL)
                .then(() => setCopied(true));
            }}
            className="pressable cursor-pointer rounded-full border-2 border-ink px-6 py-2.5 text-sm font-bold text-ink hover:bg-ink hover:text-cream"
          >
            {copied ? dict.copied : dict.copy}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-8 font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.05] text-pretty">
        {dict.title}
      </h1>
      <div className="flex flex-wrap gap-4">
        <a
          href={APP_STORE_URL}
          className="pressable rounded-full bg-ink px-7 py-4 font-bold text-white hover:opacity-85"
        >
          {stores.appStore}
        </a>
        <a
          href={GOOGLE_PLAY_URL}
          className="pressable rounded-full border-2 border-ink px-7 py-3.5 font-bold text-ink hover:bg-ink hover:text-cream"
        >
          {stores.googlePlay}
        </a>
      </div>
    </>
  );
}
