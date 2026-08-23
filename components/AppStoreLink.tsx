"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { isMetaInAppBrowser } from "@/lib/in-app-browser";
import { openAppStore } from "@/lib/store-handoff";
import { APP_STORE_URL, ROUTES } from "@/lib/site";

/**
 * The App Store button. A plain link everywhere except Meta's in-app browser,
 * which drops Apple's itms-appss:// redirect and leaves the tap doing nothing.
 * There it tries the scheme itself — from inside the click, while the user
 * gesture is still live, which is what the handoff needs — and falls back to
 * the page that explains how to get out into Safari.
 */
export default function AppStoreLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <a
      href={APP_STORE_URL}
      className={className}
      onClick={(e) => {
        if (!isMetaInAppBrowser(navigator.userAgent)) return;
        e.preventDefault();
        void openAppStore().then((opened) => {
          if (!opened) router.push(`${ROUTES.download}?stuck=1`);
        });
      }}
    >
      {children}
    </a>
  );
}
