"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pushToDataLayer } from "@/lib/gtm";
import type { Dictionary } from "@/lib/i18n/server";
import { APP_STORE_URL, GOOGLE_PLAY_URL, ROUTES } from "@/lib/site";

type Device = "ios" | "android" | "other";

function detectDevice(): Device {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPod/i.test(ua)) return "ios";
  // iPadOS 13+ reports itself as a Mac; touch support tells them apart.
  if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  return "other";
}

export default function QrRedirect({
  dict,
}: {
  dict: Dictionary["lab"]["qr"];
}) {
  const router = useRouter();

  useEffect(() => {
    const device = detectDevice();

    pushToDataLayer({
      event: "qr_scan",
      app: "cerogluten-lab",
      device_type: device,
    });

    if (device === "ios") {
      window.location.href = APP_STORE_URL;
    } else if (device === "android") {
      window.location.href = GOOGLE_PLAY_URL;
    } else {
      router.replace(ROUTES.lab);
    }
  }, [router]);

  return (
    <section className="mx-auto flex max-w-[600px] flex-col items-center px-[6%] py-25 text-center">
      <p className="mb-6 font-display text-[24px] font-extrabold leading-[1.15]">
        {dict.redirecting}
      </p>
      {/* The redirect can be blocked or slow; always leave a way through. */}
      <p className="mb-6 text-[15px] leading-[1.6] text-ink-muted">
        {dict.fallback}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href={APP_STORE_URL}
          className="rounded-full bg-ink px-6 py-3.5 font-bold text-white transition-opacity hover:opacity-85"
        >
          {dict.appStore}
        </a>
        <a
          href={GOOGLE_PLAY_URL}
          className="rounded-full border-2 border-ink px-6 py-3 font-bold text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          {dict.googlePlay}
        </a>
      </div>
    </section>
  );
}
