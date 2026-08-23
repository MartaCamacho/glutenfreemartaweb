"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/server";
import { openAppStore } from "@/lib/store-handoff";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/site";

export default function DownloadHandoff({
  dict,
  stuck,
}: {
  dict: Dictionary["download"];
  /** The store button already spent its attempt, so go straight to the way out. */
  stuck: boolean;
}) {
  const [blocked, setBlocked] = useState(stuck);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (stuck) return;

    const ua = navigator.userAgent;

    if (/Android/i.test(ua)) {
      window.location.replace(GOOGLE_PLAY_URL);
      return;
    }
    if (!/iPhone|iPad|iPod/i.test(ua)) {
      window.location.replace(APP_STORE_URL);
      return;
    }

    let alive = true;
    void openAppStore().then((opened) => {
      if (alive && !opened) setBlocked(true);
    });
    return () => {
      alive = false;
    };
  }, [stuck]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!blocked) {
    return (
      <p className="text-[18px] leading-[1.7] text-ink-soft">{dict.opening}</p>
    );
  }

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
        <p className="mb-5 break-all text-[15px] leading-[1.6] text-ink-muted">
          {APP_STORE_URL}
        </p>
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
