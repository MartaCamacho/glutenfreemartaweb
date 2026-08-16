"use client";

import { useEffect } from "react";

const ANALYTICS_COOKIE = /^(_ga|_gid|_gat)/;

/**
 * Rendered only when consent is "rejected". Withdrawing consent has to remove
 * what a previous acceptance left behind, not just stop loading GTM.
 */
export default function AnalyticsCookieCleanup() {
  useEffect(() => {
    const host = location.hostname.replace(/^www\./, "");

    for (const entry of document.cookie.split(";")) {
      const name = entry.split("=")[0]?.trim();
      if (!name || !ANALYTICS_COOKIE.test(name)) continue;

      // Google sets these on the bare domain; clear every plausible scope.
      for (const domain of ["", `; domain=${host}`, `; domain=.${host}`]) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domain}`;
      }
    }
  }, []);

  return null;
}
